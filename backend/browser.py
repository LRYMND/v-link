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
        self.url = f"http://localhost:{4001 if shared_state.isFlask else 5173}"
        self.browser = None
        self._stop_event = threading.Event()

    def run(self):
        self.start_browser()

        while not self._stop_event.is_set():
            if(shared_state.toggle_browser.is_set()):
                self._stop_event.set()
                self.stop_thread()
            time.sleep(.1)

    def stop_thread(self):
        self.close_browser()
        shared_state.toggle_browser.clear()


    def start_browser(self):
        if shared_state.isDev:
            flags = "--window-size=800,480 --disable-resize --enable-features=SharedArrayBuffer,OverlayScrollbar --autoplay-policy=no-user-gesture-required --disable-extensions"
            command = f"chromium-browser {self.url} {flags}"
        else:
            flags = "--window-size=800,480 --kiosk --enable-features=SharedArrayBuffer --autoplay-policy=no-user-gesture-required --disable-extensions"
            command = f"chromium-browser --app={self.url} {flags}"

        self.browser = subprocess.Popen(command, shell=True)
        print(f"Chromium browser started with PID: {self.browser.pid}")

    def close_browser(self):
        if self.browser:
            print(f"Closing Chromium")
            try:
                # Use subprocess to run a command that kills the process and its children
                subprocess.run(['pkill', '-P', str(self.browser.pid)])
                self.browser.wait()
                print("Chromium browser closed.")
            except subprocess.CalledProcessError:
                # Handle possible exceptions
                print("Failed to close Chromium browser.")
        else:
            print("Chromium process not found.")