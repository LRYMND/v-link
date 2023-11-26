import threading
import time
import sys
import os
import subprocess
import signal
from .shared.shared_state import shared_state

class BrowserThread(threading.Thread):
    def __init__(self):
        super().__init__()
        self.url = f"http://localhost:{5173 if shared_state.isDev else 4001}"
        self.browser_process = None
        self.browser_event = shared_state.browser_event

    def run(self):
        self.start_browser()

        while(True):
            self.process_browser_event()
            time.sleep(.1)

    def process_browser_event(self):
        if(self.browser_event.isSet()):
            self.close_browser()
            self.browser_event.clear() 


    def start_browser(self):
        if shared_state.isDev:
            flags = "--window-size=800,480 --disable-resize --enable-features=SharedArrayBuffer,OverlayScrollbar --autoplay-policy=no-user-gesture-required"
            command = f"chromium-browser {self.url} {flags}"
        else:
            flags = "--window-size=800,480 --kiosk --enable-features=SharedArrayBuffer --autoplay-policy=no-user-gesture-required"
            command = f"chromium-browser --app={self.url} {flags}"

        self.browser_process = subprocess.Popen(command, shell=True)
        print(f"Chromium browser started with PID: {self.browser_process.pid}")

    def close_browser(self):
        if self.browser_process:
            print(f"Closing Chromium")
            try:
                # Use subprocess to run a command that kills the process and its children
                subprocess.run(['pkill', '-P', str(self.browser_process.pid)])
                self.browser_process.wait()
                print("Chromium browser closed.")
            except subprocess.CalledProcessError:
                # Handle possible exceptions
                print("Failed to close Chromium browser.")
        else:
            print("Chromium process not found.")