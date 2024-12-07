import threading
import time
import sys
import serial
import uinput
from enum import Enum, auto
from pathlib import Path
from . import settings
from .shared.shared_state import shared_state

def current_time_ms():
    return int(time.time() * 1000)

def time_elapsed(start_time):
    return current_time_ms() - start_time

class Config:
    def __init__(self):
        self.lin_settings = settings.load_settings("lin")

class LinFrame:
    kMaxBytes = 8

    def __init__(self):
        self.bytes = bytearray()

    def append_byte(self, b):
        self.bytes.append(b)

    def get_byte(self, index):
        return self.bytes[index]

    def pop_byte(self):
        return self.bytes.pop()

    def num_bytes(self):
        return len(self.bytes)

    def reset(self):
        self.bytes.clear()

    def is_valid(self):
        return len(self.bytes) >= 6
    
class ButtonState(Enum):
    IDLE = auto()
    PRESSED = auto()
    LONG_PRESSED = auto()
    RELEASED = auto()

class JoystickState(Enum):
    IDLE = auto()
    MOVING = auto()
    
class LINThread(threading.Thread):
    def __init__(self):
        super(LINThread, self).__init__()
        self.config = Config()
        self.lin_frame = LinFrame()
        self.lin_serial = None

        # input device initialization
        self.input_device = uinput.Device([
            uinput.REL_X,        # Relative X axis (horizontal movement)
            uinput.REL_Y,        # Relative Y axis (vertical movement)
            uinput.BTN_LEFT,     # Mouse left click
            uinput.KEY_BACKSPACE,
            uinput.KEY_N,
            uinput.KEY_V,
            uinput.KEY_H,
            uinput.KEY_SPACE,
            uinput.KEY_UP,
            uinput.KEY_DOWN,
            uinput.KEY_LEFT,
            uinput.KEY_RIGHT
        ])

        self._stop_event = threading.Event()
        self.daemon = True

        # State variables
        self.button_state = ButtonState.IDLE
        self.joystick_state = JoystickState.IDLE
        self.current_button = None
        self.current_joystick_button = None
        self.last_button_at = None
        self.long_press_executed = False
        self.last_joystick_at = 0

        self.mouse_mode = False
        
        # Timing config
        lin_settings = self.config.lin_settings
        self.mouse_speed = lin_settings["mouse_speed"]
        self.click_timeout = lin_settings.get("click_timeout", 300) # in milliseconds
        self.long_press_duration = lin_settings.get("long_press_duration", 2000) # in milliseconds


        # Button and joystick mappings
        self.button_mappings = self._parse_command_mappings(
            lin_settings["commands"]["button"]
        )
        self.joystick_mappings = self._parse_command_mappings(
            lin_settings["commands"]["joystick"]
        )

    def _parse_command_mappings(self, commands):
        return {
            bytes.fromhex("".join(cmd.replace("0x", "") for cmd in command)): name
            for name, command in commands.items()
        }

    def run(self):
        if not shared_state.vLin:
            try:
                port = "/dev/ttyAMA0" if shared_state.rpiModel == 5 else "/dev/ttyS0"
                
                self.lin_serial = serial.Serial(port=port, baudrate=9600, timeout=1)
                self._read_from_serial()
            except Exception as e:
                print("UART error: ", e)
        else:
            self._read_from_file()

    def stop_thread(self):
        print("Stopping LIN thread.")
        time.sleep(.5)
        self._stop_event.set()
        del self.input_device # Remove uinput device

    def _read_from_serial(self):
        try:
            while not self._stop_event.is_set():
                self._process_incoming_byte(self.lin_serial.read(1))
                self._timeout_button()
        except KeyboardInterrupt:
            print("Live data collection terminated.")
        except serial.SerialException as e:
            print(f"Serial communication error: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")

    def _read_from_file(self):
        print("Replaying LIN bus data from file...")
        try:
            with open(Path(__file__).parent / "dev/lin_test.txt", "r") as file:
                for line in file:
                    if self._stop_event.is_set():
                        break
                    frame_data = [int(byte, 16) for byte in line.strip().split()]
                    for byte in frame_data:
                        self._process_incoming_byte(byte.to_bytes(1, 'big'))
                    time.sleep(0.1)
        except KeyboardInterrupt:
            print("Replay terminated.")

    def _process_incoming_byte(self, byte):
        n = self.lin_frame.num_bytes()
        sync_id = bytes.fromhex(self.config.lin_settings["sync_id"][2:])

        if byte == sync_id and n > 2 and self.lin_frame.get_byte(n - 1) == 0x00:
            self.lin_frame.pop_byte()
            self._handle_frame()
            self.lin_frame.reset()
        elif n == self.lin_frame.kMaxBytes:
            self.lin_frame.reset()
        else:
            self.lin_frame.append_byte(byte[0] if isinstance(byte, bytes) else byte)

    def _handle_frame(self):
        """Process a complete LIN frame."""
        swm_id = bytes.fromhex(self.config.lin_settings["swm_id"][2:])
        if self.lin_frame.get_byte(0) != swm_id[0]:
            return
        
        zero_code = bytes.fromhex(self.config.lin_settings["zero_code"][2:])
        if self.lin_frame.get_byte(5) == zero_code[0]:
            return

        if not self.lin_frame.is_valid():
            return

        self._handle_buttons()
        self._handle_joystick()

    def _handle_buttons(self):
        frame_data = b"".join(self.lin_frame.get_byte(i).to_bytes(1, 'big') for i in range(5))
        button_name = self.button_mappings.get(frame_data)

        if not button_name:
            if self.button_state != ButtonState.IDLE:
                self._timeout_button()  # Check if the current button needs to be released
            return

        now = current_time_ms()

        if button_name != self.current_button:
            if self.current_button:
                self._release_button(self.current_button, time_elapsed(self.button_down_at))
            self._press_button(button_name)
            self.current_button = button_name
            self.button_state = ButtonState.PRESSED
            self.button_down_at = now

        self.last_button_at = now

        # Trigger long press action if duration is exceeded and not already triggered
        if self.button_state == ButtonState.PRESSED and time_elapsed(self.button_down_at) > self.long_press_duration:
            self.button_state = ButtonState.LONG_PRESSED
            if not self.long_press_executed:  # Trigger only once
                self._trigger_long_press_action(button_name)
                self.long_press_executed = True

    def _press_button(self, button_name):
        """Press a button and trigger corresponding action."""
        print(f"Button pressed: {button_name}")
        
        match button_name:
            case "BTN_ENTER":
                print('Enter')
                if self.mouse_mode:
                    print('Left mouse click')
                    self.input_device.emit(uinput.BTN_LEFT, 1)
                    self.input_device.emit(uinput.BTN_LEFT, 0)
                else:
                    print('Spacebar')
                    self.input_device.emit_click(uinput.KEY_SPACE, 1)
            case "BTN_BACK":
                print('Back')
                self.input_device.emit_click(uinput.KEY_BACKSPACE, 1)
            case "BTN_NEXT":
                print('Next')
                self.input_device.emit_click(uinput.KEY_N, 1)
            case "BTN_PREV":
                print('Previous')
                self.input_device.emit_click(uinput.KEY_V, 1)
            case "BTN_VOL_UP":
                print('Volume up')
            case "BTN_VOL_DOWN":
                print('Volume down')
        
    def _trigger_long_press_action(self, button_name):
        """Perform a long press action."""
        print(f"Long press action triggered for {button_name}")
        match button_name:
            case "BTN_ENTER":
                shared_state.rtiStatus = not shared_state.rtiStatus
                print(f"Toggled RTI status to {shared_state.rtiStatus}")
            case "BTN_PREV":
                self.mouse_mode = not self.mouse_mode
                print(f"Toggled mouse mode to {self.mouse_mode}")

    def _release_button(self, button_name, press_duration):
        """Reset button state and ensure no redundant long-press actions."""
        print(f"Button released: {button_name} after {press_duration}ms")

        if self.long_press_executed:
            print(f"Long press action already handled for {button_name}, skipping.")
            self.long_press_executed = False
        else:
            print(f"Button {button_name} released without long press action.")

        # Reset button state
        self.button_state = ButtonState.IDLE
        self.current_button = None

    def _timeout_button(self):
        """Automatically release a button if it exceeds the click timeout."""
        if self.current_button and time_elapsed(self.last_button_at) > self.click_timeout:
            self._release_button(self.current_button, time_elapsed(self.button_down_at))

    def _handle_joystick(self):
        """Handle joystick actions based on the current mode (mouse or keyboard)."""
        frame_data = b"".join(self.lin_frame.get_byte(i).to_bytes(1, 'big') for i in range(5))
        joystick_name = self.joystick_mappings.get(frame_data)

        now = current_time_ms()

        # If no joystick input, reset state but don't reset the timeout
        if not joystick_name:
            self.joystick_state = JoystickState.IDLE
            self.current_joystick_button = None
            return

        # Mouse mode: Continuous movement
        if self.mouse_mode:
            match joystick_name:
                case "BTN_UP":
                    self._move_mouse(0, -1)
                case "BTN_DOWN":
                    self._move_mouse(0, 1)
                case "BTN_LEFT":
                    self._move_mouse(-1, 0)
                case "BTN_RIGHT":
                    self._move_mouse(1, 0)
            return

        # Enforce click timeout for keyboard mode
        if now - self.last_joystick_at < self.click_timeout:
            return

        print(f"Joystick moved: {joystick_name}")
        self.last_joystick_at = now  # Update timestamp to enforce timeout

        # Perform single key press for keyboard mode
        match joystick_name:
            case "BTN_UP":
                self.input_device.emit_click(uinput.KEY_UP, 1)
            case "BTN_DOWN":
                self.input_device.emit_click(uinput.KEY_H, 1)
            case "BTN_LEFT":
                self.input_device.emit_click(uinput.KEY_LEFT, 1)
            case "BTN_RIGHT":
                self.input_device.emit_click(uinput.KEY_RIGHT, 1)

    def _move_mouse(self, dx, dy):
        scaled_dx = int(dx * self.mouse_speed)
        scaled_dy = int(dy * self.mouse_speed)

        self.input_device.emit(uinput.REL_X, scaled_dx)
        self.input_device.emit(uinput.REL_Y, scaled_dy)

        print(f"Moving mouse, dx={scaled_dx}, dy={scaled_dy}, speed={self.mouse_speed}")
