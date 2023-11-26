# shared_state.py

import queue
import threading

class SharedState:
    def __init__(self):
        self.toggle_event = threading.Event()
        self.THREAD_STATES = {
            "Server": False,
            "Canbus": False,
            "Linbus": False,
            "VCan": False,
        }

shared_state = SharedState()