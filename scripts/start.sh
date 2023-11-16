#!/bin/bash

# Exit on error
set -e

# Function for cleanup
cleanup() {
  echo "Cleaning up..."
  kill -TERM $vite_pid $python_pid $chromium_pid 2>/dev/null
}

# Trap signals for cleanup
trap 'cleanup; exit 1' INT TERM EXIT

# Set the default values
port=""
vite_start=false
chrome_mode=""

# Check the argument passed
case "$1" in
  "dev")
    # Set port and chrome mode and indicate to start Vite for dev mode
    port="5173"
    chrome_mode="http://localhost:$port/ --window-size=800,480 --autoplay-policy=no-user-gesture-required"
    vite_start=true
    ;;
  "app")
    # Set port and chrome mode for app mode
    port="4001"
    chrome_mode="--app=http://localhost:$port/ --window-size=800,480 --disable-resize --enable-features=SharedArrayBuffer --autoplay-policy=no-user-gesture-required"
    vite_start=false
    ;;
  "kiosk")
    # Set port and chrome mode for kiosk mode
    port="5173"
    chrome_mode="http://localhost:$port/ --window-size=800,480 --kiosk --enable-features=SharedArrayBuffer --autoplay-policy=no-user-gesture-required"
    vite_start=false
    ;;
  *)
    echo "Invalid argument. Use 'app', 'dev', or 'kiosk'."
    exit 1
    ;;
esac

# Start Vite in the background if "dev" was passed
$vite_start && npm run vite & vite_pid=$!

# Start the Python server in the background
echo "Starting Backend"
python ./backend/server.py & python_pid=$!

# Print "App running at" message after the Python server has started successfully
echo "App running at: http://localhost:$port"

# Wait for a moment to ensure servers have started
sleep 3

# Start Chromium with the Vite app
echo "Starting Frontend"
chromium-browser $chrome_mode & chromium_pid=$!

# Wait for the Chromium process to finish
wait $chromium_pid

# All commands executed successfully
echo "Exit"
