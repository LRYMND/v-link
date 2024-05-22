#!/usr/bin/env python3

import smbus
import can
import errno
import RPi.GPIO as GPIO
import time
import threading

def check_i2c():
    bus_number = 1  # 1 indicates /dev/i2c-1
    bus = smbus.SMBus(bus_number)
    device_count = 0

    for device in range(3, 128):
        try:
            bus.write_byte(device, 0)
            print("Found device at {0}".format(hex(device)))
            device_count += 1
        except IOError as e:
            if e.errno != errno.EREMOTEIO:
                print("Error: {0} on address {1}".format(e, hex(device)))
        except Exception as e:  # exception if read_byte fails
            print("Error unk: {0} on address {1}".format(e, hex(device)))

    bus.close()

def check_can():
    try:
        can0 = can.interface.Bus(channel='can0', bustype='socketcan', bitrate=125000)
    except can.CanError as e:
        print("Error: Hardware error on can0 -", e)
        return

    try:
        can1 = can.interface.Bus(channel='can1', bustype='socketcan', bitrate=125000)
    except can.CanError as e:
        print("Error: Hardware error on can1 -", e)
        can0.shutdown()
        return

    try:
        msg0 = can.Message(arbitration_id=0x123, data=[1, 2, 3, 4, 5])
        can0.send(msg0)
        msg1 = can1.recv(timeout=1)
        if msg1 is None or msg1.data != msg0.data:
            print("Error: Communication failure from can0 to can1")

        msg1 = can.Message(arbitration_id=0x456, data=[6, 7, 8, 9, 10])
        can1.send(msg1)
        msg0 = can0.recv(timeout=1)
        if msg0 is None or msg0.data != msg1.data:
            print("Error: Communication failure from can1 to can0")

        print("Found can0 and can1.")
    except can.CanError as e:
        print("Error: ", e)
    finally:
        can0.shutdown()
        can1.shutdown()

def check_fan():
    GPIO.setmode(GPIO.BOARD)
    TACH = 32  # BCM 16
    GPIO.setwarnings(False)
    GPIO.setup(TACH, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    rpm_readings = []

    def fell(n):
        nonlocal t
        dt = time.time() - t
        if dt < 0.01:
            return  # reject spuriously short pulses

        freq = 1 / dt
        rpm = (freq / 2) * 60
        rpm_readings.append(rpm)
        t = time.time()

    t = time.time()
    GPIO.add_event_detect(TACH, GPIO.FALLING, fell)

    def fan_test():
        time.sleep(2)  # Simulate time for fan to raise RPM

    fan_thread = threading.Thread(target=fan_test)
    fan_thread.start()
    fan_thread.join(timeout=5)  # Allow the test to run for up to 5 seconds

    GPIO.remove_event_detect(TACH)
    GPIO.cleanup()

    if rpm_readings:
        average_rpm = sum(rpm_readings) / len(rpm_readings)
        print(f"Average RPM: {average_rpm:.0f}")
        print("Fan header test succeeded.")
    else:
        print("No Fan detected. Check wiring?")

if __name__ == "__main__":
    print("[V-LINK Hardware Test]")
    print("")

    print("Testing Analogue Interface")
    check_i2c()
    print("Testing Canbus Interface")
    check_can()
    print("Testing Fan Header")
    check_fan()