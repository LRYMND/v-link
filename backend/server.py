import threading
import os
import time
import subprocess
import eventlet

from werkzeug.serving       import run_with_reloader
from flask                  import Flask, send_from_directory, render_template
from flask_socketio         import SocketIO
from flask_cors             import CORS

from .                      import settings
from .shared.shared_state   import shared_state

# Flask configuration
server = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'), static_folder=os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist', 'assets'), static_url_path='/assets')
server.config['SECRET_KEY'] = 'your_secret_key'
CORS(server, resources={r"/*": {"origins": "*"}})

# Socket.io configuration
socketio = SocketIO(server, cors_allowed_origins="*", async_mode='eventlet')

class ServerThread(threading.Thread):

    def __init__(self):
        threading.Thread.__init__(self)
        self.daemon = True
        self.app = server
        self.socketio = socketio
        self.server = None  # Initialize self.server

    def run(self):
        print('Starting Server...')
        self.server = eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 4001)), self.app, log=open(os.devnull,"w"))

    def stop_thread(self):
        print('Stopping Server...')
        if self.server:
            self.server.stop()
            self.server = None  # Reset self.server to avoid AttributeError


    # Add custom headers to all responses
    @server.after_request
    def after_request(response):
        return response

    # Route to serve the index.html file
    @server.route('/')
    def serve_index():
        return render_template('index.html')

    # Route to serve static files (js, css, etc.) from the 'dist/assets' folder
    @server.route('/assets/<path:filename>')
    def serve_assets(filename):
        response = send_from_directory(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist', 'assets'), filename)
        response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
        response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
        return response

    # Send notification when frontend connects via socket.io
    @socketio.on('connect', namespace='/')
    def handle_connect():
        print("Client connected")

    # Return settings object to frontend via socket.io
    @socketio.on('requestSettings', namespace='/settings')
    def handle_request_settings(args):
        socketio.emit(args, settings.load_settings(args), namespace='/settings')

    # Save settings object from frontend to .config directory
    @socketio.on('saveSettings', namespace='/settings')
    def handle_save_settings(args, data):
        print('settings saving for: ' + args)
        settings.save_settings(args, data)
        socketio.emit(args, settings.load_settings(args), namespace='/settings')

    # Return filtered sensor object to frontend via socket.io
    @socketio.on('requestSensors', namespace='/settings')
    def handle_request_settings():
        sensors = {}
        sensors.update(settings.load_settings("canbus").get("sensors"))
        sensors.update(settings.load_settings("adc").get("sensors"))

        sensor_keys = [sensors[sensor_key].keys() for sensor_key in sensors]
        common_keys = set(sensor_keys[0]).intersection(*sensor_keys[1:])
        sensors = {
                sensor_key: {key: sensors[sensor_key][key] for key in common_keys}
                for sensor_key in sensors
        }
        socketio.emit('sensors', sensors, namespace='/settings')

   # Return CAN status to frontend via socket.io
    @socketio.on('requestStatus', namespace='/canbus')
    def emit_can_status():
        #socketio.emit('status', shared_state.THREAD_STATES["Canbus"], namespace='/canbus')
        print('status request') 

    # Return ADC status to frontend via socket.io
    @socketio.on('requestStatus', namespace='/adc')
    def emit_adc_status():
        #socketio.emit('status', shared_state.THREAD_STATES["ADC"], namespace='/adc')
        print('status request')

    # Return CAN data via socket.io
    @socketio.on('data', namespace='/canbus')
    def handle_can_data(data):
        socketio.emit('data', data, namespace='/canbus')

    # Return ADC data via socket.io
    @socketio.on('data', namespace='/adc')
    def handle_adc_data(data):
        socketio.emit('data', data, namespace='/adc')

     # Toggle adc stream
    @socketio.on('toggle', namespace='/adc')
    def handle_toggle_request():
        shared_state.toggle_adc.set()
        socketio.emit('status', shared_state.THREAD_STATES["ADC"], namespace='/adc')

    # Toggle canbus stream
    @socketio.on('toggle', namespace='/canbus')
    def handle_toggle_request():
        shared_state.toggle_can.set()
        socketio.emit('status', shared_state.THREAD_STATES["Canbus"], namespace='/canbus')

    # Toggle linbus stream
    @socketio.on('toggle', namespace='/linbus')
    def handle_toggle_request():
        print('toggle')

    @socketio.on('systemTask', namespace='/system')
    def handle_system_task(args):
        if   args == 'reboot':
            subprocess.run("sudo reboot -h now", shell=True)
        elif args == 'reset':
            settings.reset_settings("application")
            socketio.emit("application", settings.load_settings("application"), namespace='/settings')
        elif args == 'quit':
            shared_state.exit_event.set()
        elif args == 'restart':
            shared_state.toggle_can.set()
            shared_state.toggle_adc.set()
            shared_state.toggle_browser.set()
            

            time.sleep(5)
            
            shared_state.toggle_can.set()
            shared_state.toggle_adc.set()
            shared_state.toggle_browser.set()

        else:
            print('Unknown action:', args)