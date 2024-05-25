#!/bin/bash

# V-Link Installer - https://www.github.com/lrymnd/v-link

# Function to prompt the user for confirmation
confirm_action() {
    read -p "Do you want to $1? (y/n): " choice
    case "$choice" in 
        y|Y ) echo "Proceeding with $1...";;
        n|N ) echo "Skipping $1."; return 1;;
        * ) echo "Invalid input. Skipping $1."; return 1;;
    esac
    return 0
}

echo "Installing V-Link"

# Step 1: Update System
if confirm_action "update the system (Recommended)"; then
    sudo apt-get update && sudo apt-get upgrade
fi

# Step 2: Install Prerequisites
if confirm_action "install prerequisites (Recommended)"; then
    sudo apt-get install -y ffmpeg libudev-dev libusb-dev build-essential
fi

# Step 3: Check if Python is installed
if ! command -v python &>/dev/null; then
    if confirm_action "install Python"; then
        sudo apt-get install -y python3
    else
        echo "Python is required. Exiting."
        exit 1
    fi
else
    echo "Python is already installed."
fi

# Step 4: Check if pip is installed
if ! command -v pip &>/dev/null; then
    if confirm_action "install pip"; then
        sudo apt-get install -y python3-pip
    else
        echo "pip is required. Exiting."
        exit 1
    fi
else
    echo "pip is already installed."
fi

# Step 5: Install Volvo V-Link
if confirm_action "install Volvo V-Link"; then
    # Step 5.1: Create udev rules
    echo "Creating udev rules"
    USB_RULE_FILE=/etc/udev/rules.d/52-v-link-usb.rules
    SERIAL_RULE_FILE=/etc/udev/rules.d/52-v-link-serial.rules
    echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="1314", ATTR{idProduct}=="152*", MODE="0660", GROUP="plugdev"' | sudo tee $USB_RULE_FILE
    echo 'KERNEL=="ttyS0", MODE="0660", GROUP="plugdev"' | sudo tee $SERIAL_RULE_FILE

    if [[ $? -eq 0 ]]; then
        echo -e "Permissions created\n"
    else
        echo -e "Unable to create permissions\n"
    fi

    # Step 5.2: Download the file
    download_url="https://github.com/LRYMND/v-link/releases/download/v2.1.0/V-Link.zip"
    output_path="/home/$USER/v-link"
    echo "Downloading files to: $output_path"
    mkdir -p $output_path
    curl -L $download_url --output $output_path/V-Link.zip

    # Step 5.3: Unzip the contents
    echo "Unzipping the contents..."
    unzip $output_path/V-Link.zip -d $output_path

    # Step 5.4: Setup virtual environment
    if confirm_action "setup virtual environment (Recommended)"; then
        cd $output_path
        if [ -d "venv" ]; then
            echo "Virtual environment already exists. Activating it..."
            . venv/bin/activate
        else
            echo "Creating virtual environment..."
            python3 -m venv venv
            . venv/bin/activate
        fi
    fi

    # Step 5.5: Install requirements
    requirements="$output_path/requirements.txt"
    echo "Installing requirements..."
    pip3 install -r $requirements
    echo -e "\nV-Link installation completed.\n"

    # Step 5.6: Create autostart file for V-Link
    if confirm_action "create autostart file for V-Link"; then
        sudo bash -c "cat > /etc/xdg/autostart/v-link.desktop <<EOL
[Desktop Entry]
Name=V-Link
Exec=python3 $output_path/V-Link.py
Type=Application
EOL"
    fi
fi

# Step 6: Download overlay files to /boot/overlays
if confirm_action "download overlay files from GitHub to /boot/overlays"; then
    sudo wget -O /boot/overlays/vlink.dtbo \
        https://github.com/LRYMND/v-link/raw/master/repo/dtoverlays/vlink.dtbo
    sudo wget -O /boot/overlays/mcp2515-can1.dtbo \
        https://github.com/LRYMND/v-link/raw/master/repo/dtoverlays/mcp2515-can1.dtbo
    sudo wget -O /boot/overlays/mcp2515-can2.dtbo \
        https://github.com/LRYMND/v-link/raw/master/repo/dtoverlays/mcp2515-can2.dtbo
fi

# Step 7: Append lines to /boot/config.txt or /boot/firmware/config.txt
if confirm_action "append lines to config.txt"; then
    if [ -f /boot/config.txt ]; then
        CONFIG_PATH="/boot/config.txt"
    else
        CONFIG_PATH="/boot/firmware/config.txt"
    fi

    sudo bash -c "cat >> $CONFIG_PATH << EOF

[V-LINK]

# Enable GPIO 0&1
disable_poe_fan=1
force_eeprom_read=0

# Enable devicetree overlays
dtparam=i2c_arm=on
dtparam=spi=on

dtoverlay=vlink
dtoverlay=mcp2515-can1,oscillator=16000000,interrupt=24
dtoverlay=mcp2515-can2,oscillator=16000000,interrupt=22

# Configure IGN logic
dtoverlay=gpio-shutdown,active_low=0,gpio_pull=up,gpio_pin=1
dtoverlay=gpio-poweroff,gpiopin=0

# No Splash on boot
disable_splash=1
EOF"
fi

# Step 8: Append lines to /etc/network/interfaces
if confirm_action "append lines to /etc/network/interfaces"; then
    sudo bash -c 'cat >> /etc/network/interfaces << EOF

auto can0
iface can0 can static
        bitrate 500000
auto can1
iface can1 can static
        bitrate 500000
EOF'
fi

# Step 9: Prompt to reboot the system
if confirm_action "reboot the system now"; then
    sudo reboot
else
    echo "Reboot was skipped. Please reboot manually to apply changes."
fi

echo "All Done"