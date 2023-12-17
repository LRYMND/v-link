# backend/ __init__.py

print("Initializing backend...")

# Import modules

from .server              import ServerThread
from .canbus              import CanBusThread
from .linbus              import LinBusThread
from .browser             import BrowserThread

from .dev.vcan            import VCanThread
from .shared.shared_state import shared_state