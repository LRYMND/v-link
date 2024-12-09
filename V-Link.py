"""
    V-Link - A modular, open-source infotainment system.
    Copyright (C) 2024
    Author:     Louis Raymond - github.com/lrymnd
    Co-Author:  Tigo Passchier - github.com/tigo2000

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
"""

import sys
import os

def activate_venv():
    venv_path = f"/home/{os.getenv('USER')}/v-link/venv"
    activate_script = os.path.join(venv_path, "bin", "activate")

    if not os.path.exists(activate_script):
        raise FileNotFoundError(f"Activation script for venv not found: {activate_script}")

    # Update PATH to include the virtual environment
    os.environ["PATH"] = os.path.join(venv_path, "bin") + os.pathsep + os.environ.get("PATH", "")
    # Add site-packages to sys.path
    site_packages = os.path.join(venv_path, "lib", f"python{sys.version_info.major}.{sys.version_info.minor}", "site-packages")
    sys.path.insert(0, site_packages)

activate_venv()

import time
import argparse


from tabulate import tabulate

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.dev.vcan            import VCANThread

from backend.server              import ServerThread
from backend.app                 import APPThread
from backend.adc                 import ADCThread
from backend.rti                 import RTIThread
from backend.can                 import CANThread
from backend.lin                 import LINThread

from backend.shared.shared_state import shared_state

rpiModel = ""
rpiProtocol = ""

class VLINK:
    def __init__(self):
        self.exit_event = shared_state.exit_event
        self.rpiModel = ""
        self.rpiProtocol =""
        self.threads = {
            'server':   ServerThread(),

            'app':      APPThread(),
            'can':      CANThread(),
            'lin':      LINThread(),
            'adc':      ADCThread(),
            'rti':      RTIThread(),

            'vcan':     VCANThread(),
        }

    def detect_rpi(self):

        try:
            # Get Raspberry Model
            with open('/proc/device-tree/model', 'r') as f:
                model = f.read().strip()
                for i in range(3, 6):
                    if 'Raspberry Pi ' + str(i) in model:
                        shared_state.rpiModel = i
                        self.rpiModel = 'Raspberry Pi ' + str(i)
                        break

                    elif i == 5:
                        'Device not Recognized, using config for Raspberry Pi 4.'
                        self.rpiModel = "Unknown"
                        shared_state.rpiModel = 4
            
            # Get Session Type
            session_type = os.getenv('XDG_SESSION_TYPE')
            if session_type == 'wayland':
                shared_state.sessionType = 'wayland'
                self.rpiProtocol = 'Wayland'
            elif session_type == 'x11':
                shared_state.sessionType = 'x11'
                self.rpiProtocol = 'X11'
            else:
                self.rpiProtocol = 'Unknown'

        except FileNotFoundError:
            return 'Not running on a Raspberry Pi or file at /proc/device-tree/model not found.'
    
    def start_modules(self):
        if(shared_state.vCan):
            self.start_thread('vcan')
        time.sleep(.05)

        # Start main threads:
        self.start_thread('can')
        time.sleep(.05)
        self.start_thread('rti')
        time.sleep(.05)
        self.start_thread('lin')
        time.sleep(.05)
        self.start_thread('adc')
        time.sleep(.5)
        self.start_thread('app')

    def start_thread(self, thread_name):
        thread_class = self.threads[thread_name].__class__

        if not self.threads[thread_name].is_alive():
            self.threads[thread_name] = thread_class()
            thread = self.threads[thread_name]
            thread.daemon = True
            thread.start()
            shared_state.THREAD_STATES[thread_name] = True
            if(shared_state.verbose): print(f'{thread_name} thread started.')
        else:
            if(shared_state.verbose): print(f'{thread_name} thread is already running.')


    def stop_thread(self, thread_name):
        thread = self.threads[thread_name]
        if thread.is_alive():
            if(shared_state.verbose): print(f'Stopping {thread_name} thread.')
            thread.stop_thread()
            try:
                thread.join()
            except Exception as e:
                print(e)
            shared_state.THREAD_STATES[thread_name] = False
            if(shared_state.verbose): print(f'{thread_name} thread stopped.')


    def toggle_thread(self, thread_name):
        if shared_state.THREAD_STATES[thread_name]:
            self.stop_thread(thread_name)
            if(shared_state.verbose): print('stop thread')
        else:
            self.start_thread(thread_name)
            if(shared_state.verbose): print('start thread')


    def join_threads(self):
        for thread_name, thread in self.threads.items():
            self.stop_thread(thread_name)
            if thread.is_alive():
                shared_state.THREAD_STATES[thread_name] = False


    def process_toggle_event(self):
        if shared_state.toggle_can.is_set():
            self.toggle_thread('can')
            shared_state.toggle_can.clear()
        
        if shared_state.toggle_lin.is_set():
            self.toggle_thread('lin')
            shared_state.toggle_lin.clear()
            
        if shared_state.toggle_adc.is_set():
            self.toggle_thread('adc')
            shared_state.toggle_adc.clear()
        
        if shared_state.toggle_rti.is_set():
            self.toggle_thread('rti')
            shared_state.toggle_rti.clear()

        if shared_state.toggle_app.is_set():
            self.toggle_thread('app')
            shared_state.toggle_app.clear()


    def process_exit_event(self):
        if self.exit_event.is_set():
            self.exit_event.clear()
            shared_state.rtiStatus = False

            time.sleep(5)

            shared_state.toggle_app.set()


    def process_restart_event(self):
        if shared_state.restart_event.is_set():
            shared_state.restart_event.clear()
            for thread_name in self.threads:
                if(thread_name != 'server'):
                    self.stop_thread(thread_name)
                       
            time.sleep(.5)
            print('Restarting...')
            time.sleep(1)
            
            self.start_modules()

    def process_hdmi_event(self):
        if shared_state.hdmi_event.is_set():
            shared_state.hdmi_event.clear()
            hdmi_on, hdmi_off = (
                ("wlr-randr --output HDMI-A-1 --on", "wlr-randr --output HDMI-A-1 --off")
                if shared_state.sessionType == 'wayland'
                else ("vcgencmd display_power 1", "vcgencmd display_power 0")
            )

            if  not shared_state.hdmiStatus:
                if (shared_state.verbose): print("HDMI Off")
                os.system(hdmi_off)
            else:
                if (shared_state.verbose): print("HDMI On")
                os.system(hdmi_on)

            shared_state.hdmiStatus = not shared_state.hdmiStatus


    def print_thread_states(self):
        if(shared_state.verbose):
            for thread_name, thread in self.threads.items():
                state = 'Alive' if thread.is_alive() else 'Not Alive'
                print(f'{thread_name} Thread: {state}')
                


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
    

def setup_arguments():
    parser = argparse.ArgumentParser(
        description="Application Manual:\n\n"
                "This application can be run in various modes for development, testing, and production. "
                "Use the flags below to customize behavior.\n",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument("--verbose", action="store_true", help="Enable verbose output")
    parser.add_argument("--vcan", action="store_true", help="Simulate CAN-Bus")
    parser.add_argument("--vlin", action="store_true", help="Simulate LIN-Bus")
    parser.add_argument("--vite", action="store_false", help="Start on Vite-Port 5173")
    parser.add_argument("--nokiosk", action="store_false", help="Start in windowed mode")

    return parser.parse_args()


def display_thread_states():
    clear_screen()
    # Display the app name and version
    print("V-Link 2.2.0 | Boosted Moose")
    print('Device: ', vlink.rpiModel, ' | ', vlink.rpiProtocol)
    print("")
    print("=" * 52)  # Decorative line
    print("")
    print("Thread states:")
    table_data = [
        ["Server", "App", "CAN", "LIN", "ADC", "RTI", "VCAN"],
        [
            shared_state.THREAD_STATES['server'],
            shared_state.THREAD_STATES['app'],
            shared_state.THREAD_STATES['can'],
            shared_state.THREAD_STATES['lin'],
            shared_state.THREAD_STATES['adc'],
            shared_state.THREAD_STATES['rti'],
            shared_state.THREAD_STATES['vcan']
        ]
    ]

    table = tabulate(table_data, tablefmt="fancy_grid")
    print("\n" + table)


if __name__ == '__main__':
    clear_screen()

    vlink = VLINK()

    vlink.start_thread('server')
    vlink.detect_rpi()

    args = setup_arguments()
    
    # Update shared_state based on arguments
    shared_state.verbose = args.verbose
    shared_state.vCan = args.vcan
    shared_state.vLin = args.vlin
    shared_state.vite = args.vite
    shared_state.isKiosk = args.nokiosk

    # Start main threads:
    vlink.start_modules()
    vlink.print_thread_states()

    try:
        while not vlink.exit_event.is_set():
            vlink.process_toggle_event()
            vlink.process_exit_event()
            vlink.process_restart_event()
            vlink.process_hdmi_event()

            if not shared_state.verbose:
                display_thread_states()

            time.sleep(.1)
    except KeyboardInterrupt:
            print('\nCleaning up threads, please wait...')
    finally:
            vlink.join_threads()
            print('Done.')
            sys.exit(0)