import threading
import time
import sys
import os
import subprocess

sys.path.append('/backend')
from backend.server              import ServerThread
from backend.canbus              import CanBusThread
from backend.linbus              import LinBusThread
from backend.browser             import BrowserThread

from backend.dev.vcan            import VCanThread
from backend.shared.shared_state import shared_state

# Event to signal thread state changes
state_change_event = threading.Event()

class RTVI:
    def __init__(self):
        self.threads = {
            "VCan": VCanThread(),
            "Browser": BrowserThread(),
            "Server": ServerThread(),
            "Canbus": CanBusThread(),
            #"Linbus": LinBusThread()
        }

        self.toggle_event = shared_state.toggle_event
        self.THREAD_STATES = shared_state.THREAD_STATES

        self.start_thread("Server")


    def start_thread(self, thread_name):
        thread_class = self.threads[thread_name].__class__

        if not self.threads[thread_name].is_alive():
            self.threads[thread_name] = thread_class()
            thread = self.threads[thread_name]
            thread.daemon = True
            thread.start()
            shared_state.THREAD_STATES[thread_name] = True
            print(f"{thread_name} thread started.")
            state_change_event.set()
        else:
            print(f"{thread_name} thread is already running.")


    def stop_thread(self, thread_name):
        thread = self.threads[thread_name]
        if thread.is_alive():
            print(f"Stopping {thread_name} thread.")
            thread.stop_thread()
            thread.join()
            shared_state.THREAD_STATES[thread_name] = False
            print(f"{thread_name} thread stopped.")
            state_change_event.set()

    def toggle_thread(self, thread_name):
        if shared_state.THREAD_STATES[thread_name]:
            self.stop_thread(thread_name)
        else:
            self.start_thread(thread_name)

    def join_threads(self):
        # Stop the threads
        for thread_name in self.threads:
            self.stop_thread(thread_name)

        # Join the threads
        for thread_name, thread in self.threads.items():
            if thread.is_alive():
                thread.join()
                shared_state.THREAD_STATES[thread_name] = False
        print("Done.")

    def process_state_changes(self):
        if state_change_event.is_set():
            server_thread = self.threads["Server"]
            server_thread.set_state(shared_state.THREAD_STATES.copy())
            state_change_event.clear()

    def process_toggle_event(self):
        if self.toggle_event.is_set():
            self.toggle_thread("Canbus")  # Perform your desired action here
            self.toggle_event.clear()  # Reset the event


def clear_screen():
    if os.name == 'nt':
        os.system('cls')
    else:
        os.system('clear')

def non_blocking_input(prompt):
    try:
        return input(prompt)
    except EOFError:
        return None


if __name__ == "__main__":
    rtvi = RTVI()

    if len(sys.argv) > 1 and sys.argv[1] == "dev":
        shared_state.isDev = True
        choice = non_blocking_input("Start VCAN? (Y/N): ")
        if choice == 'Y':
            print("Starting VCAN...")
            rtvi.toggle_thread("VCan")

    time.sleep(.1)
    rtvi.start_thread("Browser")

    try:
        while(True):
            rtvi.process_toggle_event()
            time.sleep(.1)
    except KeyboardInterrupt:
            print("\nExiting... Stopping threads.")
            rtvi.join_threads()
            sys.exit(0)
    
