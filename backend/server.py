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
server.config['SECRET_KEY'] = 'v-link'
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

    # Define modules
    modules = ["app", "mmi", "can", "lin", "adc", "rti"]

    # Create event handler
    def register_socketio(module):
        namespace = f'/{module}'
        toggle_attr = f'toggle_{module}'

        # Emit module Data
        def emit_data(data):
            socketio.emit('data', data, namespace=namespace)

        # Save module settings
        def save_settings(data):
            print('saving settings for: ' + module)
            settings.save_settings(module, data)

        # Emit module settings
        def load_settings():
            print(f'emitting settings for {module}')
            socketio.emit('settings', settings.load_settings(module), namespace=namespace)

        # Emit module status
        def emit_state():
            print(f'emitting state for {module}: ', shared_state.THREAD_STATES[module])
            socketio.emit('state', shared_state.THREAD_STATES[module], namespace=namespace)

        # Toggle module status
        def toggle_state():
            getattr(shared_state, toggle_attr).set()
            socketio.emit('state', shared_state.THREAD_STATES[module], namespace=namespace)
            print(f'toggle {module}: ', shared_state.THREAD_STATES[module])


        load_settings.__name__  = f'load_settings_{module}'
        save_settings.__name__  = f'save_settings_{module}'
        emit_state.__name__     = f'emit_status_{module}'
        toggle_state.__name__   = f'handle_toggle_{module}'
        emit_data.__name__      = f'handle_data_{module}'



        socketio.on_event('load', load_settings, namespace=namespace)
        socketio.on_event('save', save_settings, namespace=namespace)
        socketio.on_event('ping', emit_state, namespace=namespace)
        socketio.on_event('toggle', toggle_state, namespace=namespace)
        socketio.on_event('data', emit_data, namespace=namespace)
        

    # Register modules
    for module in modules:
        register_socketio(module)


    # Handle IO tasks
    @socketio.on('systemTask', namespace='/sys')
    def handle_system_task(args):
        if   args == 'reboot':
            subprocess.run("sudo reboot -h now", shell=True)
        elif args == 'reset':
            settings.reset_settings("app")
            socketio.emit("application", settings.load_settings("app"), namespace='/settings')
        elif args == 'quit':
            shared_state.exit_event.set()
        elif args == 'restart':
            shared_state.toggle_can.set()
            shared_state.toggle_adc.set()
            shared_state.toggle_app.set()
            

            time.sleep(5)
            
            shared_state.toggle_can.set()
            shared_state.toggle_adc.set()
            shared_state.toggle_app.set()

        else:
            print('Unknown action:', args)