import threading
import time
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.dev.vcan            import VCANThread
from backend.browser             import BrowserThread
from backend.server              import ServerThread

from backend.adc                 import ADCThread
from backend.rti                 import RTIThread
from backend.canbus              import CANBusThread
from backend.linbus              import LINBusThread

from backend.shared.shared_state import shared_state

class VLINK:
    def __init__(self):
        self.exit_event = shared_state.exit_event
        self.threads = {
            "VCAN":     VCANThread(),
            "Browser":  BrowserThread(),
            "Server":   ServerThread(),
            "CANBus":   CANBusThread(),
            "LINBus":   LINBusThread(),
            "ADC":      ADCThread(),
            "RTI":      RTIThread(),
        }


    def start_thread(self, thread_name):
        thread_class = self.threads[thread_name].__class__

        if not self.threads[thread_name].is_alive():
            self.threads[thread_name] = thread_class()
            thread = self.threads[thread_name]
            thread.daemon = True
            thread.start()
            shared_state.THREAD_STATES[thread_name] = True
            print(f"{thread_name} thread started.")
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

    def toggle_thread(self, thread_name):
        if shared_state.THREAD_STATES[thread_name]:
            self.stop_thread(thread_name)
        else:
            self.start_thread(thread_name)

        self.print_thread_states()

    def join_threads(self):
        for thread_name in self.threads:
            self.stop_thread(thread_name)

        for thread_name, thread in self.threads.items():
            if thread.is_alive():
                thread.join()
                shared_state.THREAD_STATES[thread_name] = False
        print("Done.")

    def process_toggle_event(self):
        if shared_state.toggle_can.is_set():
            self.toggle_thread("CANBus")
            shared_state.toggle_can.clear()
            
        if shared_state.toggle_adc.is_set():
            self.toggle_thread("ADC")
            shared_state.toggle_adc.clear()

        if shared_state.toggle_browser.is_set():
            self.toggle_thread("Browser")
            shared_state.toggle_browser.clear()


    def process_exit_event(self):
        if self.exit_event.is_set():
            self.exit_event.clear()
            shared_state.toggle_browser.set()
            time.sleep(1)
            sys.exit(0)

    def print_thread_states(self):
        if(shared_state.isDev):
            for thread_name, thread in self.threads.items():
                state = "Alive" if thread.is_alive() else "Not Alive"
                print(f"{thread_name} Thread: {state}")



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
    vlink = VLINK()

    vlink.start_thread("Server")

    if len(sys.argv) > 1 and sys.argv[1] == "dev":
        shared_state.isDev = True
        choice = non_blocking_input("Simulate CAN-Bus? (Y/N): ")
        if choice.lower() == 'y':
            shared_state.vCan = True
            print("Starting VCAN...")
            vlink.toggle_thread("VCAN")

        choice = non_blocking_input("Start on Vite-Port 5173? (Y/N): ")
        if choice.lower() == 'y':
            shared_state.isFlask = False

        choice = non_blocking_input("Start in Kiosk mode? (Y/N): ")
        if choice.lower() == 'n':
            shared_state.isKiosk = False

    vlink.start_thread("CANBus")
    time.sleep(.1)
    vlink.start_thread("RTI")
    time.sleep(.1)
    #vlink.start_thread("LINBus")
    time.sleep(.1)
    vlink.start_thread("ADC")
    time.sleep(3)
    vlink.start_thread("Browser")

    vlink.print_thread_states()

    try:
        while(True):
            vlink.process_toggle_event()
            vlink.process_exit_event()
            time.sleep(.1)
    except KeyboardInterrupt:
            print("\nExiting... Stopping threads.")
            #vlink.join_threads()
            sys.exit(0)
    
