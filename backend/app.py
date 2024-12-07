import threading
import time
import sys
import os
import subprocess
import signal
from .shared.shared_state import shared_state

class APPThread(threading.Thread):
    def __init__(self):
        super().__init__()
        self.url = f"http://localhost:{4001 if shared_state.vite else 5173}"
        self.browser = None
        self._stop_event = threading.Event()

    def run(self):
        self.start_browser()

        while not self._stop_event.is_set():
            if(shared_state.toggle_app.is_set()):
                self.stop_thread()
            time.sleep(.1)

    def stop_thread(self):
        print("Stopping APP thread.")
        self._stop_event.set()
        self.close_browser()
        shared_state.toggle_app.clear()


    def start_browser(self):
        if shared_state.verbose: log_level_flag = "--log-level=3 >/dev/null 2>&1"
        else:                    log_level_flag = "--log-level=3 >/dev/null 2>&1"

        if shared_state.isKiosk:
            flags = "--window-size=800,480 --kiosk --enable-experimental-web-platform-features --enable-features=SharedArrayBuffer --autoplay-policy=no-user-gesture-required --disable-extensions  --remote-debugging-port=9222"
            command = f"chromium-browser --app={self.url} {flags} {log_level_flag}"
        else:
            flags = "--window-size=800,480 --disable-resize --enable-experimental-web-platform-features --enable-features=SharedArrayBuffer,OverlayScrollbar --autoplay-policy=no-user-gesture-required"
            command = f"chromium-browser {self.url} {flags} {log_level_flag}"


        self.browser = subprocess.Popen(command, shell=True)
        if(shared_state.verbose): print(f"Chromium browser started with PID: {self.browser.pid}")

    def close_browser(self):
        if self.browser:
            try:
                # Use subprocess to run a command that kills the process and its children
                subprocess.run(['pkill', '-P', str(self.browser.pid)])
                self.browser.wait()
            except subprocess.CalledProcessError:
                # Handle possible exceptions
                print("Failed to close App.")
        else:
            print("Chromium process not found.")