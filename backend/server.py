import threading
import os
import time
import subprocess
import eventlet

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

# Define modules
modules = ["app", "mmi", "can", "lin", "adc", "rti"]

class ServerThread(threading.Thread):
    def __init__(self):
        super().__init__()
        self.daemon = True  # Ensure thread stops when main program exits
        self.app = server
        self.stop_event = threading.Event()
        self.server_socket = eventlet.listen(('0.0.0.0', 4001))

    def run(self):
        if shared_state.verbose:
            print("Starting Eventlet WSGI server...")

        try:
            # Run the server in a green thread
            eventlet.spawn(self._serve)
            # Keep the thread alive until stop_event is set
            while not self.stop_event.is_set():
                eventlet.sleep(0.1)
        except Exception as e:
            print(e)

    def _serve(self):
        try:
            eventlet.wsgi.server(
                self.server_socket,
                self.app,
                log=open(os.devnull, "w"),  # Suppress logs
            )
        except eventlet.StopServe:
            if shared_state.verbose:
                print("Server stopped gracefully.")

    def stop_thread(self):
        if shared_state.verbose:
            print("Stopping Eventlet server...")
            time.sleep(.5)

        # Raise StopServe to terminate the WSGI server loop
        eventlet.spawn(self.server_socket.close)
        self.stop_event.set()
        
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
        if (shared_state.verbose): print("Client connected")



    # Create event handler
    def register_socketio(module):
        namespace = f'/{module}'
        toggle_attr = f'toggle_{module}'

        # Emit module Data
        def emit_data(data):
            socketio.emit('data', data, namespace=namespace)

        # Save module settings
        def save_settings(data):
            settings.save_settings(module, data)

        # Emit module settings
        def load_settings():
            socketio.emit('settings', settings.load_settings(module), namespace=namespace)

        # Emit module status
        def emit_state():
            thread_state = shared_state.THREADS.get(module, None)
            thread_state = thread_state.is_alive() if thread_state else False
            socketio.emit('state', thread_state, namespace=namespace)

        # Toggle module status
        def toggle_state():
            if (shared_state.verbose): print('Toggling Thread')
            getattr(shared_state, toggle_attr).set()

            thread_state = shared_state.THREADS.get(module, None)
            thread_state = thread_state.is_alive() if thread_state else False
            socketio.emit('state', not thread_state, namespace=namespace)


        load_settings.__name__  = f'load_settings_{module}'
        save_settings.__name__  = f'save_settings_{module}'
        emit_state.__name__     = f'emit_status_{module}'
        toggle_state.__name__   = f'handle_toggle_{module}'
        emit_data.__name__      = f'handle_data_{module}'



        socketio.on_event('load', load_settings, namespace=namespace)
        socketio.on_event('save', save_settings, namespace=namespace)
        socketio.on_event('ping', emit_state, namespace=namespace)
        socketio.on_event('data', emit_data, namespace=namespace)

        socketio.on_event('toggle', toggle_state, namespace=namespace)
        

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
            socketio.emit("settings", settings.load_settings("app"), namespace='/app')
        elif args == 'rti':
            shared_state.rtiStatus = not shared_state.rtiStatus
            shared_state.hdmiStatus = shared_state.rtiStatus
            if (shared_state.verbose): print("hdmi status", shared_state.hdmiStatus)
            if (shared_state.verbose): print("rti status", shared_state.rtiStatus)
            socketio.emit('state', shared_state.rtiStatus, namespace="/rti")
            shared_state.hdmi_event.set()
        elif args == 'quit':
            shared_state.exit_event.set()
        elif args == 'restart':
            shared_state.restart_event.set()
        elif args == 'hdmi':
            shared_state.hdmi_event.set()
        else:
            if (shared_state.verbose): print('Unknown action:', args)