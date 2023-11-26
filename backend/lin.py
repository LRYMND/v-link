import time
from linFrame import LinFrame
import serial
import pyautogui

## Volvo P1 SWM key codes 
# IGN_KEY_ON     50 E 0 F1
#
# BTN_NEXT       20 0 10 0 0 EF
# BTN_PREV       20 0 2 0 0 FD
# BTN_VOL_UP     20 0 0 1 0 FE
# BTN_VOL_DOWN   20 0 80 0 0 7F
# BTN_BACK       20 0 1 0 0 F7
# BTN_ENTER      20 0 8 0 0 FE
# BTN_UP         20 1 0 0 0 FE
# BTN_DOWN       20 2 0 0 0 FD
# BTN_LEFT       20 4 0 0 0 FB
# BTN_RIGHT      20 8 0 0 0 F7

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

# Initialization
LINSerial = serial.Serial(port="/dev/ttyS0", baudrate=9600, timeout=1)
RTISerial = serial.Serial(port="/dev/ttyS1", baudrate=2400, timeout=1)

currentMillis = lastRtiWrite = buttonDownAt = lastButtonAt = lastJoystickButtonAt = 0
on = enableMouse = manualOn = False
currentButton = currentJoystickButton = 0
mouseSpeed = MOUSE_BASE_SPEED
rtiStep = 0

# Functions
def read_lin_bus():
    global currentMillis, lastJoystickButtonAt, currentJoystickButton, enableMouse, mouseSpeed

    if LINSerial.in_waiting > 0:
        b = LINSerial.read()
        n = LinFrame.num_bytes()

        if b == 0x55 and n > 2 and LinFrame.get_byte(n - 1) == 0:
            LinFrame.pop_byte()
            handle_swm_frame()
            LinFrame.reset()
        elif n == LinFrame.kMaxBytes:
            LinFrame.reset()
        else:
            LinFrame.append_byte(b)

def handle_swm_frame():
    if LinFrame.get_byte(0) != 0x20:
        return

    if not LinFrame.isValid():
        return

    handle_buttons()
    handle_joystick()

def handle_buttons():
    global currentButton, buttonDownAt, lastButtonAt

    button = LinFrame.get_byte(2)

    if not button:
        return

    if button != currentButton:
        release_button(currentButton, since(buttonDownAt))
        click_button(button)

        currentButton = button
        buttonDownAt = currentMillis

    lastButtonAt = currentMillis

def timeout_button():
    global currentButton, lastButtonAt

    if not currentButton:
        return

    if since(lastButtonAt) > CLICK_TIMEOUT:
        release_button(currentButton, since(buttonDownAt))

def release_button(button, clickDuration):
    global on, enableMouse, currentButton

    if button == BUTTON_ENTER:
        if not on and clickDuration > ON_CLICK_DURATION:
            manualOn = True
            turn_on()
    elif button == BUTTON_BACK:
        if clickDuration > OFF_CLICK_DURATION:
            manualOn = False
            turn_off()
    elif button == BUTTON_PREV:
        if clickDuration > SWITCH_MOUSE_CLICK_DURATION:
            if enableMouse:
                enableMouse = False
            else:
                enableMouse = True

    currentButton = 0

def click_button(button):
    global on, enableMouse

    if not on:
        return

    if button == BUTTON_ENTER:
        if not enableMouse:
            pyautogui.press('space')
        else:
            pyautogui.click()
    elif button == BUTTON_BACK:
        pyautogui.press('backspace')
    elif button == BUTTON_PREV:
        pyautogui.press('v')
    elif button == BUTTON_NEXT:
        pyautogui.press('n')

def handle_joystick():
    global on, currentJoystickButton, lastJoystickButtonAt, enableMouse, mouseSpeed

    if not on:
        return

    button = LinFrame.get_byte(1)
    timeout_joystick_button()

    if button != currentJoystickButton:
        currentJoystickButton = button
        mouseSpeed = MOUSE_BASE_SPEED

        if not enableMouse:
            click_joystick(button)

    if not enableMouse:
        return

    if button == JOYSTICK_UP:
        move_mouse(0, -1)
    elif button == JOYSTICK_DOWN:
        move_mouse(0, 1)
    elif button == JOYSTICK_LEFT:
        move_mouse(-1, 0)
    elif button == JOYSTICK_RIGHT:
        move_mouse(1, 0)

def click_joystick(button):
    global lastJoystickButtonAt

    if not on:
        return

    if button == JOYSTICK_UP:
        pyautogui.press('H')
    elif button == JOYSTICK_DOWN:
        pyautogui.press('down')
    elif button == JOYSTICK_LEFT:
        pyautogui.press('left')
    elif button == JOYSTICK_RIGHT:
        pyautogui.press('right')

    lastJoystickButtonAt = currentMillis

def timeout_joystick_button():
    global currentJoystickButton, lastJoystickButtonAt

    if not currentJoystickButton:
        return

    if since(lastJoystickButtonAt) > CLICK_TIMEOUT:
        currentJoystickButton = 0

def move_mouse(dx, dy):
    global mouseSpeed

    pyautogui.moveRel(dx * mouseSpeed, dy * mouseSpeed)
    mouseSpeed += MOUSE_SPEEDUP

def turn_on():
    global on
    on = True

def turn_off():
    global on
    on = False

def rti():
    global lastRtiWrite, rtiStep

    if since(lastRtiWrite) < RTI_INTERVAL:
        return

    if rtiStep == 0:
        rti_print(0x40 if on else 0x46)
        rtiStep += 1
    elif rtiStep == 1:
        rti_print(0x20)
        rtiStep += 1
    elif rtiStep == 2:
        rti_print(0x83)
        rtiStep = 0

    lastRtiWrite = currentMillis

def rti_print(byte):
    RTISerial.write(byte.to_bytes(1, byteorder='big'))

def dump_frame():
    for i in range(LinFrame.num_bytes()):
        print(format(LinFrame.get_byte(i), '02X'), end=' ')
    print()

def since(timestamp):
    return currentMillis - timestamp

# Main Loop
try:
    while True:
        currentMillis = int(round(time.time() * 1000))

        read_lin_bus()
        timeout_button()
        rti()

except KeyboardInterrupt:
    print("Script terminated by user.")
finally:
    LINSerial.close()
    RTISerial.close()
