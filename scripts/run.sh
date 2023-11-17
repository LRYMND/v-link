#!/bin/bash
if [ -z "$VIRTUAL_ENV" ]; then
    echo -e "\e[91mPython Virtual environment (venv) is not activated. Please activate it first by running:\e[0m"
    echo -e "\e[93msource /home/$USER/volvo-rtvi/backend/bin/activate\e[0m"
    
    exit 1
fi

source /home/$USER/volvo-rtvi/backend/bin/activate
python3 /home/$USER/volvo-rtvi/backend/app.py &
chromium-browser http://localhost:4001/ --window-size=800,480 --kiosk --enable-features=SharedArrayBuffer --autoplay-policy=no-user-gesture-required --disable-cloud-management --enable-experimental-web-platform-features --enable-features=JavaScriptExperimentalSharedMemory
