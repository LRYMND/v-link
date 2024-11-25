import threading
import time
import sys
import serial
import uinput
from pathlib import Path
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
        self.long_press_frame_count = 0
        self.last_button_name = None
        self.frame_threshold = self.config.linSettings["frame_threshold"]
        self.long_press_frame_treshold = self.config.linSettings["long_press_frame_treshold"]

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
        # Look up both button and joystick codes
        button_name = self.button_codes.get(frame_data) or self.joystick_codes.get(frame_data) 

        if button_name:
            # joystick
            if button_name in self.joystick_codes.values():
                return button_name, False  # Joystick buttons only trigger short press

            # Check if the button is the same as the last one pressed, otherwise count other button
            if button_name == self.last_button_name:
                self.frame_count += 1
                self.long_press_frame_count += 1
            else:
                self.frame_count = 1
                self.long_press_frame_count += 1
                self.last_button_name = button_name

            # short press
            if self.frame_count == self.frame_threshold:
                self.frame_count = 0
                return button_name, False

            # long press based on long press treshold
            if self.long_press_frame_count >= self.long_press_frame_treshold:
                self.long_press_frame_count = 0
                return button_name, True
            
            return button_name, None
        else:
            # Reset frame count if no button is detected
            self.frame_count = 0
            self.long_press_frame_count = 0
            self.last_button_name = None

        return None, False


class LINThread(threading.Thread):
    def __init__(self):
        super(LINThread, self).__init__()
        self.config = Config()
        self.linframe = LinFrame()
        self.button_handler = ButtonHandler()
        self.LINSerial = None
        self.mouseSpeed = self.config.linSettings["mouse_speed"]
        self.mouseMode = False

        # Initialize uinput device for mouse and keyboard
        self.device = uinput.Device([
            uinput.REL_X,        # Relative X axis (horizontal movement)
            uinput.REL_Y,        # Relative Y axis (vertical movement)
            uinput.BTN_LEFT,     # Left mouse button
            # uinput.BTN_RIGHT,    # Right mouse button
            uinput.KEY_BACKSPACE,
            uinput.KEY_N,
            uinput.KEY_V,
            uinput.KEY_G,
            uinput.KEY_B,
            uinput.KEY_SPACE,
            uinput.KEY_UP,
            uinput.KEY_DOWN,
            uinput.KEY_LEFT,
            uinput.KEY_RIGHT
        ])

        self._stop_event = threading.Event()
        self.daemon = True
        self.linframe = LinFrame()

    def run(self):
        if not shared_state.vLin:
            try:
                if(shared_state.rpiModel == 5):
                    self.LINSerial = serial.Serial(port="/dev/ttyAMA0", baudrate=9600, timeout=1)
                else:
                    self.LINSerial = serial.Serial(port="/dev/ttyS0", baudrate=9600, timeout=1)
                self.read_from_serial()
            except Exception as e:
                print("uart error: ", e)
        else:
            self.read_from_file()

    def stop_thread(self):
        print("Stopping LIN thread.")
        time.sleep(.5)
        self._stop_event.set()

    def read_from_serial(self):
        try:
            while not self._stop_event.is_set():
                self.process_incoming_byte(self.LINSerial.read(1))
        except KeyboardInterrupt:
            print("Live data collection terminated.")
        finally:
            if self.LINSerial.is_open:
                self.LINSerial.close()

    def read_from_file(self):
        print("Replaying LIN bus data from file...")
        try:
            with open(Path(__file__).parent / "dev/lin_test.txt", "r") as file:
                for line in file:
                    if self._stop_event.is_set():
                        break
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
        
        # do not continue on zero values (nothing being pressed)
        zero_code = bytes.fromhex(self.config.linSettings["zero_code"][2:])
        if self.linframe.get_byte(5) == zero_code:
            return 

        if not self.linframe.is_valid():
            return

        # Handle buttons if the frame is valid
        self.handle_buttons()
        self.linframe.reset()

    def handle_buttons(self):
        frame_data = b"".join(self.linframe.get_byte(i) for i in range(5))
        checksum = self.linframe.get_byte(5)

        # Check if frame_data matches IGN_KEY_ON from linSettings
        ign_key_on = bytes.fromhex("".join(cmd.replace("0x", "") for cmd in self.config.linSettings["ign_on"]))
        if frame_data == ign_key_on:
            return

        button_name, is_long_press = self.button_handler.handle_button_press(frame_data)
        if button_name:
            if is_long_press:
                if button_name == "BTN_BACK":
                    # Toggle RTI (open/close)
                    shared_state.rtiStatus = not shared_state.rtiStatus
                    print(f"Toggled RTI status to {shared_state.rtiStatus}")

                elif button_name == "BTN_ENTER":
                    # Toggle mouse mode
                    self.mouseMode = not self.mouseMode
                    print(f"Toggled mouse mode to {self.mouseMode}")
            else:
                print(f'Pressing: {button_name}')
                self.execute_action(button_name)
        else:
            formatted_frame_data = " ".join(f"{byte:02X}" for byte in frame_data) + f" {checksum.hex().upper()}"
            print(f"Unrecognized frame: {formatted_frame_data}")
    
    def execute_action(self, button_name):
        try:
            match button_name:
                # Emulate the SWC module as keyboard.
                # These configurations need to stay hardcoded.
                # It's possible to configure the actions through the app.
                case "BTN_ENTER":
                    print('Enter')
                    if(self.mouseMode):
                        self.device.emit_click(uinput.BTN_LEFT, 1)
                    else:
                        self.device.emit_click(uinput.KEY_SPACE, 1)
                case "BTN_BACK":
                    print('Back')
                    self.device.emit_click(uinput.KEY_BACKSPACE, 1)
                case "BTN_NEXT":
                    print('Next')
                    self.device.emit_click(uinput.KEY_N, 1)
                case "BTN_PREV":
                    print('Previous')
                    self.device.emit_click(uinput.KEY_V, 1)
                case "BTN_VOL_UP":
                    print('Volume up')
                    self.device.emit_click(uinput.KEY_G, 1)
                case "BTN_VOL_DOWN":
                    print('Volume down')
                    self.device.emit_click(uinput.KEY_B, 1)
                case "BTN_UP":
                    print('Joystick up')
                    if(self.mouseMode):
                        self.move_mouse(0, -1)
                    else:
                        self.device.emit_click(uinput.KEY_UP, 1)
                case "BTN_DOWN":
                    print('Joystick down')
                    if(self.mouseMode):
                        self.move_mouse(0, 1)
                    else:
                        self.device.emit_click(uinput.KEY_DOWN, 1)
                case "BTN_LEFT":
                    print('Joystick left')
                    if(self.mouseMode):
                        self.move_mouse(-1, 0)
                    else:
                        self.device.emit_click(uinput.KEY_LEFT, 1)
                case "BTN_RIGHT":
                    print('Joystick right')
                    if(self.mouseMode):
                        self.move_mouse(1, 0)
                    else:
                        self.device.emit_click(uinput.KEY_RIGHT, 1)
        except Exception as e:
            print(f"Error in action: {e}")

    def move_mouse(self, dx, dy):
        # Move mouse relative to current position using uinput
        self.device.emit(uinput.REL_X, dx * self.mouseSpeed)
        self.device.emit(uinput.REL_Y, dy * self.mouseSpeed)
        self.mouseSpeed += self.config.linSettings["mouse_multiplier"]
