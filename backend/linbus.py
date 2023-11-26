import threading
import time
import serial
import pyautogui

class Config:
    # Constants
    JOYSTICK_UP = 0x1
    JOYSTICK_DOWN = 0x2
    JOYSTICK_LEFT = 0x4
    JOYSTICK_RIGHT = 0x8
    BUTTON_BACK = 0x1
    BUTTON_ENTER = 0x8
    BUTTON_NEXT = 0x10
    BUTTON_PREV = 0x2

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

            if b == 0x55 and n > 2 and self.linframe.get_byte(n - 1) == 0:
                self.linframe.pop_byte()
                self.handle_swm_frame()
                self.linframe.reset()
            elif n == self.linframe.kMaxBytes:
                self.linframe.reset()
            else:
                self.linframe.append_byte(b)

    def handle_swm_frame(self):
        if self.linframe.get_byte(0) != 0x20:
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
            self.rti_print(0x40 if self.on else 0x46)
            self.rtiStep += 1
        elif self.rtiStep == 1:
            self.rti_print(0x20)
            self.rtiStep += 1
        elif self.rtiStep == 2:
            self.rti_print(0x83)
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

