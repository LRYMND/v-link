# shared_state.py

import queue
import threading

class SharedState:
    def __init__(self):
        self.isDev = False
        self.vCan = False
        self.isFlask = True

        self.exit_event = threading.Event()

        self.toggle_adc = threading.Event()
        self.toggle_can = threading.Event()
        self.toggle_lin = threading.Event()
        self.toggle_browser = threading.Event()


        self.THREAD_STATES = {
            "Server":   False,
            "ADC":      False,
            "Canbus":   False,
            "Linbus":   False,
            "VCan":     False,
        }

shared_state = SharedState()