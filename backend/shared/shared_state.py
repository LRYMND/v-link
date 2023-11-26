# shared_state.py

import queue
import threading

class SharedState:
    def __init__(self):
        self.isDev = False
        self.toggle_event = threading.Event()
        self.THREAD_STATES = {
            "Server": False,
            "Canbus": False,
            "Linbus": False,
            "VCan": False,
        }

        self.exit_event = threading.Event()
        self.browser_event = threading.Event()

shared_state = SharedState()