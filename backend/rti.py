import threading
import time
import sys
import os
import subprocess
import serial
from .shared.shared_state import shared_state

class RTIThread(threading.Thread):
    def __init__(self):
        super().__init__()
        self.rti_serial = serial.Serial('/dev/ttyAMA1', baudrate = 2400, timeout = 1)
        self._stop_event = threading.Event()
        self.daemon = True

    def run(self):
        self.run_rti()
        
    def stop_thread(self):
        self._stop_event.set()

    def write(self, byte):
        self.rti_serial.write(byte.to_bytes(1, 'big'))
        time.sleep(0.1)

    def run_rti(self):
        while not self._stop_event.is_set():
            if shared_state.rtiStatus == True:
                self.write(0x40)
            if shared_state.rtiStatus == False:
                self.write(0x46)
            
            self.write(0x20)
            self.write(0x83)
        os.system("vcgencmd display_power 0")