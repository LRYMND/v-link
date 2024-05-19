import threading
import time
import serial
import pyautogui

class Config:
    # Constants
    JOYSTICK_UP = b'\x01'
    JOYSTICK_DOWN = b'\x02'
    JOYSTICK_LEFT = b'\x04'
    JOYSTICK_RIGHT = b'\x08'
    BUTTON_BACK = b'\x01'
    BUTTON_ENTER = b'\x08'
    BUTTON_NEXT = b'\x10'
    BUTTON_PREV = b'\x02'

    SYNC_ID = b'\x55'
    SWM_ID = b'\x20'

    ON_CLICK_DURATION = 100
    OFF_CLICK_DURATION = 3000
    SWITCH_MOUSE_CLICK_DURATION = 2000
    CLICK_TIMEOUT = 300
    MOUSE_BASE_SPEED = 8
    MOUSE_SPEEDUP = 3
    RTI_INTERVAL = 100

class LinFrame:
    kMaxBytes = 8

    def __init__(self):
        self.bytes = []

    def append_byte(self, b):
        self.bytes.append(b)

    def pop_byte(self):
        return self.bytes.pop()

    def get_byte(self, index):
        return self.bytes[index]

    def num_bytes(self):
        return len(self.bytes)

    def reset(self):
        self.bytes = []

    def computeChecksum(self):
        # LIN V2 checksum includes the ID byte, V1 does not.
        # startByteIndex = 0 if custom_defs.kUseLinChecksumVersion2 else 1
        startByteIndex = 1
        p = self.bytes[startByteIndex:]

        # Exclude the checksum byte at the end of the frame.
        num_bytes_to_checksum = len(p) - 1

        # Sum bytes. We should not have 16-bit overflow here since the frame has a limited size.
        # Convert bytes to integers before summing.
        sum_value = sum(x if isinstance(x, int) else int.from_bytes(x, 'big') for x in p[:num_bytes_to_checksum])

        # Keep adding the high and low bytes until no carry.
        for _ in range(256):
            high_byte = (sum_value >> 8) & 0xFF
            if not high_byte:
                break
            sum_value = (sum_value & 0xFF) + high_byte

        return (~sum_value) & 0xFF

    def setLinIdChecksumBits(self, id_byte):
        p1_at_b7 = bytes([0xFF])
        p0_at_b6 = bytes([0x00])

        # P1: id5, P0: id4
        shifter = int.from_bytes(id_byte, 'big') << 2
        p1_at_b7 = bytes([x ^ shifter & 0xFF for x in p1_at_b7])
        p0_at_b6 = bytes([x ^ shifter & 0xFF for x in p0_at_b6])

        # P1: id4, P0: id3
        shifter += shifter
        p1_at_b7 = bytes([x ^ shifter & 0xFF for x in p1_at_b7])

        # P1: id3, P0: id2
        shifter += shifter
        p1_at_b7 = bytes([x ^ shifter & 0xFF for x in p1_at_b7])
        p0_at_b6 = bytes([x ^ shifter & 0xFF for x in p0_at_b6])

        # P1: id2, P0: id1
        shifter += shifter
        p0_at_b6 = bytes([x ^ shifter & 0xFF for x in p0_at_b6])

        # P1: id1, P0: id0
        shifter += shifter
        p1_at_b7 = bytes([x ^ shifter & 0xFF for x in p1_at_b7])
        p0_at_b6 = bytes([x ^ shifter & 0xFF for x in p0_at_b6])

        result = (int.from_bytes(p1_at_b7, 'big') & 0b10000000) | (int.from_bytes(p0_at_b6, 'big') & 0b01000000) | (int.from_bytes(id_byte, 'big') & 0b00111111)
        return result.to_bytes(1, 'big')
    
    def isValid(self):
        n = len(self.bytes)

        # Check frame size.
        # One ID byte with optional 1-8 data bytes and 1 checksum byte.
        # TODO: should we enforce only 1, 2, 4, or 8 data bytes? (total size 1, 3, 4, 6, or 10)
        #
        # TODO: should we pass through frames with ID only (n == 1, no response from slave).
        if n != 1 and (n < 3 or n > 10):
            return False

        # Check ID byte checksum bits.
        id_byte = self.bytes[0]
        if id_byte != self.setLinIdChecksumBits(id_byte):
            return False

        # If not an ID only frame, check also the overall checksum.
        #print(n)
        # if n > 1:
        #     if self.bytes[n - 1] != self.computeChecksum():
        #         return False

        # TODO: check protected id.
        return True

class LinBusThread(threading.Thread):
    def __init__(self):
        super(LinBusThread, self).__init__()
        
        self._stop_event = threading.Event()
        self.daemon = True
        self.linframe = LinFrame()
        self.config = Config()
        self.LINSerial = serial.Serial(port="/dev/ttyS0", baudrate=9600, timeout=1)
        self.currentMillis = self.lastRtiWrite = self.buttonDownAt = self.lastButtonAt = self.lastJoystickButtonAt = 0
        self.on = self.enableMouse = self.manualOn = False
        self.currentButton = self.currentJoystickButton = 0
        self.mouseSpeed = self.config.MOUSE_BASE_SPEED
        self.rtiStep = 0

    def run(self):
        try:
            while not self._stop_event.is_set():
                self.currentMillis = int(round(time.time() * 1000))
                self.read_lin_bus()
                self.timeout_button()
                self.rti()
        except KeyboardInterrupt:
            print("LIN bus thread terminated by user.")
        finally:
            self.LINSerial.close()

    def stop_thread(self):
        print("Stopping LIN bus thread.")
        self._stop_event.set()

    def read_lin_bus(self):
        if self.LINSerial.in_waiting > 0:
            b = self.LINSerial.read()
            n = self.linframe.num_bytes()
            
            if b == self.config.SYNC_ID and n > 2 and self.linframe.get_byte(n - 1) == b'\x00':
                self.linframe.pop_byte()
                self.handle_swm_frame()
                self.linframe.reset()
            elif n == self.linframe.kMaxBytes:
                self.linframe.reset()
            else:
                self.linframe.append_byte(b)

    def read_lin_bus_from_file(self, file_path):
        with open(file_path, 'rb') as file:
            b = file.read(1)
            
            while b:
                n = self.linframe.num_bytes()
                if b == self.config.SYNC_ID and n > 2 and self.linframe.get_byte(n - 1) == b'\x00':
                    self.linframe.pop_byte()
                    self.handle_swm_frame()
                    self.linframe.reset()
                elif n == self.linframe.kMaxBytes:
                    self.linframe.reset()
                else:
                    self.linframe.append_byte(b)

                # Read the next byte
                b = file.read(1)

    def handle_swm_frame(self):
        if self.linframe.get_byte(0) != self.config.SWM_ID: 
            return

        if not self.linframe.isValid():
            return

        self.handle_buttons()
        self.handle_joystick()

    def handle_buttons(self):
        button = self.linframe.get_byte(2)

        if not button:
            return

        if button != self.currentButton:
            self.release_button(self.currentButton, self.since(self.buttonDownAt))
            self.click_button(button)

            self.currentButton = button
            self.buttonDownAt = self.currentMillis

        self.lastButtonAt = self.currentMillis

    def timeout_button(self):
        if self.currentButton and self.since(self.lastButtonAt) > self.config.CLICK_TIMEOUT:
            self.release_button(self.currentButton, self.since(self.buttonDownAt))

    def release_button(self, button, click_duration):
        if button == self.config.BUTTON_ENTER:
            if not self.on and click_duration > self.config.ON_CLICK_DURATION:
                self.manualOn = True
                self.turn_on()
        elif button == self.config.BUTTON_BACK:
            if click_duration > self.config.OFF_CLICK_DURATION:
                self.manualOn = False
                self.turn_off()
        elif button == self.config.BUTTON_PREV:
            if click_duration > self.config.SWITCH_MOUSE_CLICK_DURATION:
                if self.enableMouse:
                    self.enableMouse = False
                else:
                    self.enableMouse = True

        self.currentButton = 0

    def click_button(self, button):
        if not self.on:
            return

        print('clicking button')
        if button == self.config.BUTTON_ENTER:
            if not self.enableMouse:
                pyautogui.press('space')
            else:
                pyautogui.click()
        elif button == self.config.BUTTON_BACK:
            pyautogui.press('backspace')
        elif button == self.config.BUTTON_PREV:
            pyautogui.press('v')
        elif button == self.config.BUTTON_NEXT:
            pyautogui.press('n')

    def handle_joystick(self):
        if not self.on:
            return

        button = self.linframe.get_byte(1)
        self.timeout_joystick_button()

        if button != self.currentJoystickButton:
            self.currentJoystickButton = button
            self.mouseSpeed = self.config.MOUSE_BASE_SPEED

            if not self.enableMouse:
                self.click_joystick(button)

        if not self.enableMouse:
            return

        if button == self.config.JOYSTICK_UP:
            self.move_mouse(0, -1)
        elif button == self.config.JOYSTICK_DOWN:
            self.move_mouse(0, 1)
        elif button == self.config.JOYSTICK_LEFT:
            self.move_mouse(-1, 0)
        elif button == self.config.JOYSTICK_RIGHT:
            self.move_mouse(1, 0)

    def click_joystick(self, button):
        if not self.on:
            return
        
        print('emulating joystick')

        if button == self.config.JOYSTICK_UP:
            pyautogui.press('H')
        elif button == self.config.JOYSTICK_DOWN:
            pyautogui.press('down')
        elif button == self.config.JOYSTICK_LEFT:
            pyautogui.press('left')
        elif button == self.config.JOYSTICK_RIGHT:
            pyautogui.press('right')

        self.lastJoystickButtonAt = self.currentMillis

    def timeout_joystick_button(self):
        if self.currentJoystickButton and self.since(self.lastJoystickButtonAt) > self.config.CLICK_TIMEOUT:
            self.currentJoystickButton = 0

    def move_mouse(self, dx, dy):
        pyautogui.moveRel(dx * self.mouseSpeed, dy * self.mouseSpeed)
        self.mouseSpeed += self.config.MOUSE_SPEEDUP

    def turn_on(self):
        self.on = True

    def turn_off(self):
        self.on = False

    def rti(self):
        if self.since(self.lastRtiWrite) < self.config.RTI_INTERVAL:
            return

        if self.rtiStep == 0:
            self.rti_print(b'\x40' if self.on else b'\x46')
            self.rtiStep += 1
        elif self.rtiStep == 1:
            self.rti_print(b'\x20')
            self.rtiStep += 1
        elif self.rtiStep == 2:
            self.rti_print(b'\x83')
            self.rtiStep = 0

        self.lastRtiWrite = self.currentMillis

    def rti_print(self, byte):
        self.RTISerial.write(byte.to_bytes(1, byteorder='big'))

    def since(self, timestamp):
        return self.currentMillis - timestamp

# Example usage
if __name__ == "__main__":
    lin_bus_thread = LinBusThread()
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

