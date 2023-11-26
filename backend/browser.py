import threading
import time
import sys
import os
import subprocess
import signal
from .shared.shared_state import shared_state

# Rest of your imports

class BrowserThread(threading.Thread):
    def __init__(self):
        super().__init__()
        self.url = f"http://localhost:{5173 if shared_state.isDev else 4001}"
        self.browser_process = None

    def run(self):
        self.start_browser()

    def start_browser(self):
        # Configure the flags based on whether it's a development environment or not
        if shared_state.isDev:
            flags = "--window-size=800,480 --disable-resize --enable-features=SharedArrayBuffer,OverlayScrollbar --autoplay-policy=no-user-gesture-required"
            command = f"chromium-browser {self.url} {flags}"
        else:
            flags = "--window-size=800,480 --kiosk --enable-features=SharedArrayBuffer --autoplay-policy=no-user-gesture-required"
            command = f"chromium-browser --app={self.url} {flags}"

        # Start the browser
        self.browser_process = subprocess.Popen(command, shell=True)
        print(f"Chromium browser started with PID: {self.browser_process.pid}")

    def close_browser(self):
        if self.browser_process:
            # Kill the Chromium browser process using the PID
            print(f"Terminating Chromium browser with PID: {self.browser_process.pid}")
            os.kill(self.browser_process.pid, signal.SIGTERM)
            self.browser_process.wait()  # Wait for the process to finish
            print("Chromium browser terminated.")
        else:
            print("Chromium browser process not found.")

# Rest of your class definitions
