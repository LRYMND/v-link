import threading
import time
import json
import os
import numpy as np
import socketio
from .shared.shared_state import shared_state

import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

i2c = None
ads = None

try:
    i2c = busio.I2C(board.SCL, board.SDA)
    ads = ADS.ADS1115(i2c)
except Exception as e:
    print(e)
PULL_UP = 2000
STEP = 0.5


class ADCThread(threading.Thread):
    def __init__(self):
        super().__init__()
        self.client = socketio.Client()
        self._stop_event = threading.Event()

        self.channels = []

        self.sensor_data = None
        self.pressure_data = None
        self.temperature_data = None

    def run(self):
        if (ads):
            self.read_settings()
            self.connect_to_socketio()
            self.start_adc()

    def stop_thread(self):
        self._stop_event.set()
        self.client.disconnect()
        #self.disconnect_from_socketio()


    def start_adc(self):
        while not self._stop_event.is_set():
            self.read_sensor()
            time.sleep(.1)


    def read_settings(self):
        self.sensor_data = self.read_sensor_data_from_json()

        for i, (sensor_name, sensor_details) in enumerate(self.sensor_data["sensors"].items()):
            channel = sensor_details["channel"]
            analog_in_instance = AnalogIn(ads, getattr(ADS, channel))
            self.channels.append(analog_in_instance)


    def read_sensor(self):    
        for i, (key, value) in enumerate(self.sensor_data["sensors"].items()):
            voltage = self.channels[i].voltage
            resistance = None

            if value["ntc"]:
                resistance = PULL_UP * voltage / (5 - voltage)

            characteristics = value["characteristic"]
            interpolated_value = self.interpolate_value(voltage, resistance, characteristics)

            data = (f"{value['vlink_id']}{interpolated_value}")
            self.emit_data_to_frontend(data)

    def interpolate_value(self, voltage, resistance, characteristics):
        interpolated_value = None
        
        # Calculate Value based on NTC characteristics
        if resistance is not None:
            closest_resistances = sorted(characteristics.keys(), key=lambda x: abs(float(x) - resistance))[:2]
            value1, value2 = characteristics[closest_resistances[0]], characteristics[closest_resistances[1]]
            interpolated_value = value1 + (value2 - value1) * (resistance - float(closest_resistances[0])) / (float(closest_resistances[1]) - float(closest_resistances[0]))
            interpolated_value = round(interpolated_value / STEP) * STEP

        # Calculate Value based on Voltage characteristics
        else:
            voltage_values = [float(key) for key in characteristics.keys()]
            pressure_values = list(characteristics.values())

            # Find the two closest pairs
            value1 = min(range(len(voltage_values)), key=lambda i: abs(voltage_values[i] - voltage))
            value2 = max(range(len(voltage_values)), key=lambda i: abs(voltage_values[i] - voltage))

            # Linear interpolation
            interpolated_value = pressure_values[value1] + (pressure_values[value2] - pressure_values[value1]) * (
                voltage - voltage_values[value1]
            ) / (voltage_values[value2] - voltage_values[value1])
        
        return interpolated_value

    def read_sensor_data_from_json(self, filename="adc.json"):
        config_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config')
        file_path = os.path.join(config_folder, filename)
        with open(file_path, "r") as file:
            data = json.load(file)
            return data

    def connect_to_socketio(self):
        max_retries = 5
        current_retry = 0
        while not self.client.connected and current_retry < max_retries and not self._stop_event.is_set():
            try:
                self.client.connect('http://localhost:4001', namespaces=['/adc'])
            except Exception as e:
                print(f"ADCThread: Socket.IO connection failed. Retry {current_retry}/{max_retries}. Error: {e}")
                time.sleep(2)
                current_retry += 1

        if self.client.connected:
            print("ADCThread connected to Socket.IO")
        else:
            print("ADCThread failed to connect to Socket.IO.")

    def disconnect_from_socketio(self):
        print("Disconnecting ADCThread")
        self.client.disconnect()
        if not self.client.connected:
            print("ADCThread disconnected.")

    def emit_data_to_frontend(self, data):
        if self.client and self.client.connected:
            self.client.emit('data', data, namespace='/adc')