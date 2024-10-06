# shared_state.py

import queue
import threading

class SharedState:
    def __init__(self):
        #Global Variables
        self.isDev = False
        self.vCan = False
        self.isFlask = True
        self.isKiosk = True
        self.rtiStatus = True


        #Thread States:
        self.toggle_adc = threading.Event()
        self.toggle_can = threading.Event()
        self.toggle_lin = threading.Event()
        self.toggle_rti = threading.Event()
        self.toggle_browser = threading.Event()

        self.exit_event = threading.Event()

        self.THREAD_STATES = {
            "VCAN":     False,
            "Browser":  False,
            "Server":   False,
            "CANBus":   False,
            "LINBus":   False,
            "ADC":      False,
            "RTI":      False,
        }

shared_state = SharedState()