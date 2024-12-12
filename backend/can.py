import threading
import time
import can
import socketio
import sys
from . import settings
from .shared.shared_state import shared_state

class Config:
    def __init__(self):
        self.canSettings = settings.load_settings("can")
        self.refresh_rate = self.canSettings["timing"]["refresh_rate"]
        self.interval = self.canSettings["timing"]["interval"]
        self.timeout = self.canSettings["timing"]["timeout"]
        self.msg_hs = []
        self.msg_ls = []

        self.initialize_sensors()

    def initialize_sensors(self):
        for key, sensor in self.canSettings['sensors'].items():
            req_id = int(sensor['req_id'], 16)
            rep_id = int(sensor['rep_id'], 16)
            target = int(sensor['target'], 16)
            action = int(sensor['action'], 16)
            parameter0 = int(sensor['parameter'][0], 16)
            parameter1 = int(sensor['parameter'][1], 16)

            dlc = 0xC8 + len([byte for byte in [rep_id, target, action, parameter0, parameter1] if byte != 0])

            req_id_bytes = [req_id]
            message_bytes = [dlc, target, action, parameter0, parameter1, 0x01, 0x00, 0x00]

            rep_id_bytes = [rep_id]
            scale = sensor['scale']
            is_16bit = sensor['is_16bit']
            id = sensor['app_id']

            refresh_rate = sensor['refresh_rate']
            if refresh_rate == "high":
                self.msg_hs.append((req_id_bytes, rep_id_bytes, message_bytes, scale, is_16bit, id))
            elif refresh_rate == "low":
                self.msg_ls.append((req_id_bytes, rep_id_bytes, message_bytes, scale, is_16bit, id))

class CANThread(threading.Thread):
    def __init__(self):
        super(CANThread, self).__init__()
        self._stop_event = threading.Event()
        self.daemon = True
        self.client = socketio.Client()
        self.config = Config()
        self.can_bus = None

    def run(self):
        self.connect_to_socketio()
        self.initialize_canbus()
        self.run_can_bus()

    def initialize_canbus(self):
        try:
            if(shared_state.vCan):
                self.can_bus = can.interface.Bus(channel='vcan0', bustype='socketcan', bitrate=500000)
            else:    
                self.can_bus = can.interface.Bus(channel='can0', bustype='socketcan', bitrate=500000)    
        except Exception as e:
            print(f'Error initializing CAN Bus: {e}')

    def stop_thread(self):
        print("Stopping CAN thread.")
        time.sleep(.5)
        self._stop_event.set()

    def stop_canbus(self):
        if self.can_bus:
            self.can_bus.shutdown()

    def connect_to_socketio(self):
        max_retries = 10
        current_retry = 0
        while not self.client.connected and current_retry < max_retries:
            try:
                self.client.connect('http://localhost:4001', namespaces=['/can'])
            except Exception as e:
                print(f"Socket.IO connection failed. Retry {current_retry}/{max_retries}. Error: {e}")
                time.sleep(.5)
                current_retry += 1
        if(shared_state.verbose):
            if self.client.connected:
                print("CAN connected to Socket.IO")
            else:
                print("CAN failed to connect to Socket.IO.")

    def emit_data_to_frontend(self, data):
        if self.client and self.client.connected:
            self.client.emit('data', data, namespace='/can')

    def request(self, sensors):
        for message in sensors:
            msg = can.Message(arbitration_id=message[0][0], data=message[2], is_extended_id=True)
            self.can_bus.send(msg)

            timer = time.time()

            while not self._stop_event.is_set():
                current_time = time.time()
                received = self.filter(self.can_bus.recv(.01), message)
                
                if(received): break
                if(current_time - timer >= self.config.timeout): break
                

    def receive(self, sensors):
        while not self._stop_event.is_set():
            data = self.can_bus.recv()

            for message in sensors:
                self.filter(data, message)


    def filter(self, data, message):
        if (data):
            if data.arbitration_id == message[1][0] and data.data[4] == message[2][4]:
                value = (data.data[5] << 8) | data.data[6] if message[4] else data.data[5]
                converted_value = eval(message[3], {'value': value})

                data = message[5] + str(float(converted_value))
                self.emit_data_to_frontend(data)
                sys.stdout.flush()
                return True
            else:
                return False

    def run_can_bus(self):
        x = 0
        try:
            while not self._stop_event.is_set():
                if x <= self.config.interval:
                    try:
                        self.request(self.config.msg_hs)
                    except Exception as e:
                        print("can error: ", e)
                    time.sleep(self.config.refresh_rate)
                x += 1
                if x == self.config.interval:
                    try:
                        self.request(self.config.msg_ls)
                    except Exception as e:
                        print("can error: ", e) 
                    x = 0
        except Exception as e:
            print(e)
        finally:
            self.stop_canbus()