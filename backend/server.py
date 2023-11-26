import threading
import time
import os
import subprocess
import eventlet

from werkzeug.serving       import run_with_reloader
from flask                  import Flask, send_from_directory, render_template
from flask_socketio         import SocketIO
from flask_cors             import CORS

from .                      import settings
from .shared.shared_state   import shared_state

# Flask configuration
server = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), '..', 'dist'), static_folder=os.path.join(os.path.dirname(__file__), '..', 'dist', 'assets'), static_url_path='/assets')
server.config['SECRET_KEY'] = 'your_secret_key'
CORS(server, resources={r"/*": {"origins": "*"}})

# Socket.io configuration
socketio = SocketIO(server, cors_allowed_origins="*", async_mode='eventlet')

class ServerThread(threading.Thread):

    def __init__(self, isDev):
        threading.Thread.__init__(self)
        self.isDev = isDev
        self.daemon = True
        self.app = server
        self.socketio = socketio
        self.server = None  # Initialize self.server
        self.current_state = {}
        self.toggle_event = shared_state.toggle_event
        self.THREAD_STATES = shared_state.THREAD_STATES

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
        response = send_from_directory(os.path.join(os.path.dirname(__file__), '..', 'dist', 'assets'), filename)
        response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
        response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
        return response

    # Send notification when frontend connects via socket.io
    @socketio.on('connect')
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

    # Return settings object to frontend via socket.io
    @socketio.on('requestStatus', namespace='/canbus')
    def emit_can_status():
        socketio.emit('status', shared_state.THREAD_STATES["Canbus"], namespace='/canbus')

    # Return settings object to frontend via socket.io
    @socketio.on('data', namespace='/canbus')
    def handle_can_data(data):
        socketio.emit('data', data, namespace='/canbus')

    # Toggle canbus stream
    @socketio.on('toggle', namespace='/canbus')
    def handle_canbus_request():
        shared_state.toggle_event.set()

    # Toggle linbus stream
    @socketio.on('toggle', namespace='/linbus')
    def handle_linbus_request():
        print('toggle')

    @socketio.on('performIO', namespace='/io')
    def handle_perform_io(args):
        print('Executing io: ' + args)

        if args == 'reboot':
            subprocess.run("sudo reboot -h now", shell=True)
        elif args == 'reset':
            settings.reset_settings("application")
            socketio.emit("application", settings.load_settings("application"), namespace='/settings')
        else:
            print('Unknown action:', args)