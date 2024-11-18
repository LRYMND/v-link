#!/bin/bash

# V-Link Installer - https://www.github.com/lrymnd/v-link

# Function to prompt the user for confirmation
confirm_action() {
    while true; do
        read -p "Do you want to $1? (y/n): " choice
        case "$choice" in 
            y|Y ) return 0;;
            n|N ) return 1;;
            * ) echo "Invalid input. Please enter 'y' or 'n'.";;
        esac
    done
}

user_exit() {
    echo "Aborted by user. Exiting."
    exit 1
}

echo "Installing V-Link"

# Determine Raspberry Pi Version
if [ -f /proc/device-tree/model ]; then
    # Read the content of the model file, stripping any null bytes with `strings`
    model=$(strings /proc/device-tree/model)

    # Loop through the Raspberry Pi models we want to detect
    rpiModel=""
    for i in 3 4 5; do
        if [[ "$model" == *"Raspberry Pi $i"* ]]; then
            echo "Raspberry Pi $i detected."
            rpiModel=$i
            break
        fi
    done

    # Default to Raspberry Pi 4 if no match found and rpiModel is unset
    if [ -z "$rpiModel" ]; then
        echo "Device not recognized, using config for Raspberry Pi 4."
        if ! confirm_action "proceed anyways"; then
            user_exit
        else
            rpiModel=4
        fi
    fi
else
    echo "Not running on a Raspberry Pi or file at /proc/device-tree/model not found."
    if ! confirm_action "proceed anyways"; then
        user_exit
    fi
fi

# Step 1: Update System
if confirm_action "update the system (Recommended)"; then
    sudo apt-get update && sudo apt-get upgrade
fi

# Step 2: Check if Python is installed
if ! command -v python &>/dev/null; then
    if confirm_action "install Python"; then
        sudo apt-get install -y python3
    else
        echo "Python is required. Exiting."
        exit 1
    fi
fi

# Step 3: Check if pip is installed
if ! command -v pip &>/dev/null; then
    if confirm_action "install pip"; then
        sudo apt-get install -y python3-pip
    else
        echo "pip is required. Exiting."
        exit 1
    fi
fi

# Step 4: Install Volvo V-Link
if confirm_action "install Boosted Moose V-Link now"; then
    # Step 4.1: Install dependencies
    sudo apt-get install -y ffmpeg libudev-dev libusb-dev build-essential
    # Step 4.2: Create udev rules
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

    # Step 4.3: Download the file
    download_url="https://github.com/LRYMND/v-link/releases/download/v2.1.0/V-Link.zip"
    output_path="/home/$USER/v-link"
    echo "Downloading files to: $output_path"
    mkdir -p $output_path
    curl -L $download_url --output $output_path/V-Link.zip

    # Step 4.4: Unzip the contents
    echo "Unzipping the contents..."
    unzip $output_path/V-Link.zip -d $output_path

    # Step 4.5: Setup virtual environment
    cd $output_path
    if [ -d "venv" ]; then
        echo "Virtual environment already exists."
        . venv/bin/activate
    else
        echo "Creating virtual environment..."
        python3 -m venv venv
        . venv/bin/activate
    fi

    # Step 4.6: Install requirements
    requirements="$output_path/requirements.txt"
    echo "Installing requirements..."
    pip3 install -r $requirements
    echo -e "\nV-Link installation completed.\n"
else
    user_exit
fi

# Step 5: Download overlay files to /boot/overlays
if confirm_action "install the custom DTOverlays? (Required for V-Link HAT)"; then
    # Set the target overlay directory based on rpiModel
    if [ "$rpiModel" -eq 5 ]; then
        OVERLAY_DIR="/boot/firmware/overlays"
    else
        OVERLAY_DIR="/boot/overlays"
    fi

    # Download the overlays to the determined directory
    sudo wget -O "$OVERLAY_DIR/vlink.dtbo" \
        https://github.com/LRYMND/v-link/raw/master/repo/dtoverlays/vlink.dtbo
    sudo wget -O "$OVERLAY_DIR/mcp2515-can1.dtbo" \
        https://github.com/LRYMND/v-link/raw/master/repo/dtoverlays/mcp2515-can1.dtbo
    sudo wget -O "$OVERLAY_DIR/mcp2515-can2.dtbo" \
        https://github.com/LRYMND/v-link/raw/master/repo/dtoverlays/mcp2515-can2.dtbo

    echo "Adding autostart entries for CAN at /etc/network/interfaces."
    sudo bash -c 'cat >> /etc/network/interfaces <<EOF
auto can0
iface can0 can static
        bitrate 500000
auto can1
iface can1 can static
        bitrate 500000
EOF'
fi

# Step 6: Append lines to /boot/config.txt or /boot/firmware/config.txt
if confirm_action "append lines to config.txt"; then
    if [ -f /boot/config.txt ]; then
        CONFIG_PATH="/boot/config.txt"
    else
        CONFIG_PATH="/boot/firmware/config.txt"
    fi

    #Determin RPi version and set config.txt accordingly.
    if [[ "$rpiModel" -eq 5 ]]; then
        sudo bash -c 'cat >> /boot/firmware/config.txt <<EOF

[V-LINK RPi5]

#Enable GPIO 0&1
disable_poe_fan=1
force_eeprom_read=0

#Enable devicetree overlays
dtparam=spi=on
dtparam=i2c_arm=on

dtoverlay=vlink
dtparam=uart0=on
dtoverlay=uart2-pi5
dtoverlay=mcp2515-can1,oscillator=16000000,interrupt=24
dtoverlay=mcp2515-can2,oscillator=16000000,interrupt=22

#Configure IGN logic
dtoverlay=gpio-shutdown,active_low=0,gpio_pull=up,gpio_pin=1
dtoverlay=gpio-poweroff,gpiopin=0

#No Splash on boot
disable_splash=1
EOF'

    else
        sudo bash -c 'cat >> /boot/config.txt <<EOF

[V-LINK]

# Enable GPIO 0&1
disable_poe_fan=1
force_eeprom_read=0

# Enable devicetree overlays
dtparam=i2c_arm=on
dtparam=spi=on

dtoverlay=vlink
dtoverlay=uart3
dtoverlay=mcp2515-can1,oscillator=16000000,interrupt=24
dtoverlay=mcp2515-can2,oscillator=16000000,interrupt=22

# Configure IGN logic
dtoverlay=gpio-shutdown,active_low=0,gpio_pull=up,gpio_pin=1
dtoverlay=gpio-poweroff,gpiopin=0

# No Splash on boot
disable_splash=1
EOF'
    fi
fi

# Step 7: Create autostart file for V-Link
if confirm_action "create autostart file for V-Link"; then
        sudo bash -c "cat > /etc/xdg/autostart/v-link.desktop <<EOL
[Desktop Entry]
Name=V-Link
Exec=sh -c '. $output_path/venv/bin/activate && python3 $output_path/V-Link.py'
Type=Application
EOL"
fi

# Step 8: Prompt to reboot the system
if confirm_action "reboot the system now"; then
    sudo reboot
else
    echo "Reboot was skipped. Please reboot manually to apply all changes."
fi

echo "All Done. Drive carefully :)"