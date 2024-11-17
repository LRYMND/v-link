import threading
import time
import sys
import serial
import pyautogui
from . import settings
from .shared.shared_state import shared_state

class Config:
    def __init__(self):
        self.linSettings = settings.load_settings("lin")


class LinFrame:
    kMaxBytes = 8

    def __init__(self):
        self.bytes = []

    def append_byte(self, b):
        self.bytes.append(b)

    def get_byte(self, index):
        return self.bytes[index]

    def pop_byte(self):
        return self.bytes.pop()

    def num_bytes(self):
        return len(self.bytes)

    def reset(self):
        self.bytes = []

    def is_valid(self):
        return len(self.bytes) >= 6

class ButtonHandler:
    def __init__(self):
        self.config = Config()
        self.frame_count = 0
        self.last_button_name = None
        self.last_button_time = None
        print(self.config.linSettings)
        self.frame_threshold = self.config.linSettings["frame_threshold"]

        # Convert button and joystick commands from hex strings to bytes and store in dictionaries
        self.button_codes = {
            bytes.fromhex("".join(cmd.replace("0x", "") for cmd in command)): name
            for name, command in self.config.linSettings["commands"]["button"].items()
        }
        self.joystick_codes = {
            bytes.fromhex("".join(cmd.replace("0x", "") for cmd in command)): name
            for name, command in self.config.linSettings["commands"]["joystick"].items()
        }

    def handle_button_press(self, frame_data):
        # Look up button name using both button and joystick mappings
        button_name = self.button_codes.get(frame_data) or self.joystick_codes.get(frame_data)

        if button_name:
            # Check if the button is the same as the last one pressed
            if button_name == self.last_button_name:
                self.frame_count += 1
            else:
                self.frame_count = 1
                self.last_button_name = button_name

            # Check if the frame count exceeds the threshold
            if self.frame_count >= self.frame_threshold:
                return button_name, True
            return button_name, False
        else:
            # Reset frame count if no button is detected
            self.frame_count = 0
            self.last_button_name = None

        return None, False

class LINThread(threading.Thread):
    def __init__(self, mode="live", file_path=None):
        super(LINThread, self).__init__()
        self.config = Config()
        self.linframe = LinFrame()
        self.button_handler = ButtonHandler()
        self.mode = mode
        self.file_path = file_path

        if mode == "live":
            if(shared_state.rpiModel == 5):
                self.LINSerial = serial.Serial(port="/dev/ttyAMA0", baudrate=9600, timeout=1)
            else:
                self.LINSerial = serial.Serial(port="/dev/ttyS0", baudrate=9600, timeout=1)

        self._stop_event = threading.Event()
        self.daemon = True
        self.linframe = LinFrame()

    def run_lin_bus(self):
        try:
            while not self._stop_event.is_set():
                if self.LINSerial.in_waiting > 0:
                    self.process_incoming_byte(self.LINSerial.read(1))
        except KeyboardInterrupt:
            print("LIN bus thread terminated by user.")
        finally:
            self.LINSerial.close()

    def stop_thread(self):
        print("Stopping LIN bus thread.")
        self._stop_event.set()

    def read_from_file(self):
        print("Replaying LIN bus data from file...")
        try:
            with open(self.file_path, "r") as file:
                for line in file:
                    frame_data = [int(byte, 16) for byte in line.strip().split()]
                    for byte in frame_data:
                        self.process_incoming_byte(byte.to_bytes(1, 'big'))
                    time.sleep(0.1)
        except KeyboardInterrupt:
            print("Replay terminated.")

    def process_incoming_byte(self, byte):
        n = self.linframe.num_bytes()

        # Access SYNC_ID from linSettings and convert it to bytes
        sync_id = bytes.fromhex(self.config.linSettings["sync_id"][2:])
        
        # Check if the incoming byte matches SYNC_ID and conditions for handling the frame
        if byte == sync_id and n > 2 and self.linframe.get_byte(n - 1) == b'\x00':
            self.linframe.pop_byte()
            self.handle_swm_frame()
            self.linframe.reset()
        elif n == self.linframe.kMaxBytes:
            self.linframe.reset()
        else:
            self.linframe.append_byte(byte)

    def handle_swm_frame(self):
        # Check SWM_ID in frame against linSettings
        swm_id = bytes.fromhex(self.config.linSettings["swm_id"][2:])
        
        if self.linframe.get_byte(0) != swm_id:
            return 
        
        zero_code = bytes.fromhex(self.linSettings["zero_code"][2:])
        
        # If the zero code is matched, return
        if self.linframe.get_byte(5) == zero_code:
            return 

        if not self.linframe.is_valid():
            return

        # Handle buttons if the frame is valid
        self.handle_buttons()
        self.linframe.reset()

    def handle_buttons(self):
        # Concatenate bytes to form the frame data
        frame_data = b"".join(self.linframe.get_byte(i) for i in range(5))
        checksum = self.linframe.get_byte(5)
        
        # Format the frame data for printing/logging
        formatted_frame_data = " ".join(f"{byte:02X}" for byte in frame_data) + f" {checksum.hex().upper()}"

        # Check if frame_data matches IGN_KEY_ON from linSettings
        ign_key_on = bytes.fromhex("".join(self.config.linSettings["ign_on"]))
        if frame_data == ign_key_on:
            return
        
        # Get the button name and action activation status
        button_name, activate_action = self.button_handler.handle_button_press(frame_data)
        
        if button_name:
            if button_name == "BTN_BACK":
                self.shutdown_frame_count += 1
                # Access shutdown threshold from linSettings
                shutdown_threshold = self.config.linSettings["shutdown_threshold"]

                if self.shutdown_frame_count >= shutdown_threshold:
                    if shared_state.rtiStatus:
                        # Stop RTI thread if running
                        shared_state.rtiStatus = False
                        print('[STOP RTI]')
                    self.shutdown_frame_count = 0
            else:
                # Reset shutdown frame count if a different button is pressed
                self.shutdown_frame_count = 0

            # Perform button actions if action activation is required
            if activate_action:
                self.execute_action(button_name)
                # Uncomment the line below for debugging/logging purposes
                # print(f"[{formatted_frame_data}] Activated: {button_name}")
        else:
            # Log unrecognized frames
            print(f"Unrecognized frame: {formatted_frame_data}")

    def execute_action(self, button_name):
        match button_name:
            case "BTN_ENTER":
                print('Enter')
                if not shared_state.rtiStatus:
                    # Start RTI thread here
                    shared_state.rtiStatus = True
                    print('[START RTI]')
            case "BTN_BACK":
                print('Back')
            case "BTN_NEXT":
                print('Next')
            case "BTN_PREV":
                print('Previous')
            case "BTN_VOL_UP":
                print('Volume up')
            case "BTN_VOL_DOWN":
                print('Volume down')
            case "BTN_UP":
                print('Joystick up')
            case "BTN_DOWN":
                print('Joystick down')
            case "BTN_LEFT":
                print('Joystick left')
            case "BTN_RIGHT":
                print('Joystick right')


# Example usage
if __name__ == "__main__":
    mode = "live" if len(sys.argv) == 1 else "replay"
    file_path = sys.argv[1] if mode == "replay" else None

    lin_bus_thread = LINThread(mode=mode, file_path=file_path)
    lin_bus_thread.start()

    try:
        while True:
            # Your main loop logic here
            pass

    except KeyboardInterrupt:
        print("Script terminated by user.")
    finally:
        lin_bus_thread.stop_thread()
        lin_bus_thread.join()

