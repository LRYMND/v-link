import can
import random
import time
import struct
import threading
import subprocess
import os

from ..shared.shared_state import shared_state

class VCANThread(threading.Thread):
    def __init__(self):
        super(VCANThread, self).__init__()
        self._stop_event = threading.Event()
        self.daemon = True
        self.can_bus = None

        # Initial values
        INTAKE = 20.0
        BOOST = 1.0
        COOLANT = 90.0
        LAMBDA1 = 0.01
        LAMBDA2 = 0.85
        VOLTAGE = 14.0

        self.VALUES = [INTAKE, BOOST, COOLANT, LAMBDA1, LAMBDA2, VOLTAGE]
        self.TEMPLATE = [0xcd, 0x7a, 0xa6, 0x00, 0x00, 0x40, 0x0, 0x0]


        script_directory = os.path.dirname(os.path.abspath(__file__))
        setup_script_path = os.path.join(script_directory, 'setup.sh')
        subprocess.run([setup_script_path], shell=True)


    def run(self):
        try:
            self.can_bus = can.interface.Bus(channel='vcan0', bustype='socketcan', bitrate=500000)
            # Enter a loop to continuously check for messages on vcan0
            while not self._stop_event.is_set():
                message = self.can_bus.recv()
                self.check_message(message)
        finally:
            self.can_bus.shutdown()

    def stop_thread(self):
        print("Stopping CanBusTestThread")
        self._stop_event.set()
        self.stop_canbus()

    def stop_canbus(self):
        try:
            if self.can_bus:
                self.can_bus.shutdown()
                print('Canbus stopped.')
        except Exception as e:
            print(f'Error stopping CAN Bus: {e}')

    def check_message(self, message):
        # Define the request array
        request = [
            [0x12, 0x9D],
            [0x10, 0x34],

            [0x10, 0xCE],
            [0x10, 0xD8],
            [0x10, 0x0A],
            [0x10, 0x2C],
        ]

        # Check if the 4th and 5th bytes match any entry in the request array
        for index, req in enumerate(request):
            if list(message.data[3:5]) == req:
                self.send_message(req)

    def send_message(self, id):
        self.TEMPLATE[3:5] = list(id)

        # Generate a random offset in the range [-0x10, 0x10]
        random_offset = random.randint(-0x01, 0x01)
        self.TEMPLATE[5:6] = struct.pack('>B', (self.TEMPLATE[5] + random_offset) & 0xFF)
        response_message = can.Message(arbitration_id=0x00400021, data=self.TEMPLATE, is_extended_id=True)

        # Send the response
        self.can_bus.send(response_message)