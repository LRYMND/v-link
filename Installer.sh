#!/bin/bash

# V-Link Installer - https://www.github.com/lrymnd/v-link

# CHECK PERMISSION
if [[ $EUID -ne 0 ]]; then
  echo "This script must be run as root to install certain services. Please use sudo. More information can be found in the source of this installer." >&2
  exit 1
fi

if [ -z "$SUDO_USER" ]; then
    # Fallback: Get the current user
    CURRENT_USER=$(whoami)
else
    CURRENT_USER=$SUDO_USER
fi

# HELPER FUNCTIONS
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

fix_ownership() {
    sudo chown -R "$CURRENT_USER:$CURRENT_USER" "$1"
}

user_exit() {
    echo "Aborted by user. Exiting."
    exit 1
}

setup_complete() {
    echo "Setup complete. Drive carefully :)"
}

# SETUP
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
    sudo apt-get install -y ffmpeg libudev-dev libusb-dev build-essential python3-venv

    # Step 4.4: Download the file
    download_url="https://github.com/LRYMND/v-link/releases/download/v2.2.0/V-Link.zip"
    output_path="/home/$CURRENT_USER/v-link"
    echo "Downloading files to: $output_path"
    sudo mkdir -p "$output_path"
    sudo curl -L "$download_url" --output "$output_path/V-Link.zip"
    fix_ownership "$output_path"

    # Step 4.5: Unzip the contents
    echo "Unzipping the contents..."
    sudo -u "$CURRENT_USER" unzip "$output_path/V-Link.zip" -d "$output_path"

    # Step 4.6: Setup virtual environment
    cd "$output_path"
    if [ -d "venv" ]; then
        echo "Virtual environment already exists."
        source venv/bin/activate
    else
        echo "Creating virtual environment..."
        sudo -u "$CURRENT_USER" python3 -m venv venv
        source venv/bin/activate
    fi

    # Step 4.7: Install requirements
    requirements="$output_path/requirements.txt"
    if [ -f "$requirements" ]; then
        echo "Installing requirements..."
        pip install -r "$requirements"
    else
        echo "Requirements file not found: $requirements"
    fi

    echo -e "\nV-Link installation completed.\n"
    fix_ownership "$output_path"
else
    if confirm_action "do you want to abort the installation"; then
        user_exit
    fi
fi


# Step 5: Download overlay files to /boot/overlays
if confirm_action "install the custom DTOverlays? (Required for V-Link HAT)"; then
    OVERLAY_DIR="/boot/firmware/overlays"

    # Download the overlays to the determined directory
    sudo wget -O "$OVERLAY_DIR/v-link.dtbo" \
        https://github.com/LRYMND/v-link/raw/master/resources/dtoverlays/v-link.dtbo
    sudo wget -O "$OVERLAY_DIR/mcp2515-can1.dtbo" \
        https://github.com/LRYMND/v-link/raw/master/resources/dtoverlays/mcp2515-can1.dtbo
    sudo wget -O "$OVERLAY_DIR/mcp2515-can2.dtbo" \
        https://github.com/LRYMND/v-link/raw/master/resources/dtoverlays/mcp2515-can2.dtbo
fi

# Step 6: Append lines to /boot/config.txt or /boot/firmware/config.txt
if confirm_action "append lines to /boot/firmware/config.txt"; then
    # Renaming pwrkey service so ign logic works:
    echo "Renaming /etc/xdg/autostart/pwrkey.desktop to pwrkey.desktop.backup"
    sudo mv /etc/xdg/autostart/pwrkey.desktop /etc/xdg/autostart/pwrkey.desktop.backup

    CONFIG_PATH="/boot/firmware/config.txt"

    # Determine RPi version and set config.txt accordingly.
    if [[ "$rpiModel" -eq 5 ]]; then
        sudo bash -c 'cat >> /boot/firmware/config.txt <<EOF

[V-LINK RPi5]

#Enable GPIO 0&1
disable_poe_fan=1
force_eeprom_read=0

#Enable devicetree overlays
dtparam=spi=on
dtparam=i2c_arm=on

dtoverlay=v-link
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

    elif [[ "$rpiModel" -eq 4 ]]; then
        sudo bash -c 'cat >> /boot/firmware/config.txt <<EOF

[V-LINK RPi4]

#Enable GPIO 0&1
disable_poe_fan=1
force_eeprom_read=0

#Enable devicetree overlays
dtparam=spi=on
enable_uart=1
dtparam=i2c_arm=on

dtoverlay=v-link
dtoverlay=uart3
dtoverlay=mcp2515-can1,oscillator=16000000,interrupt=24
dtoverlay=mcp2515-can2,oscillator=16000000,interrupt=22

#Configure IGN logic
dtoverlay=gpio-shutdown,active_low=0,gpio_pull=up,gpio_pin=1
dtoverlay=gpio-poweroff,gpiopin=0

#No Splash on boot
disable_splash=1
EOF'

    else
        sudo bash -c 'cat >> /boot/firmware/config.txt <<EOF

[V-LINK RPi3]

#Enable GPIO 0&1
disable_poe_fan=1
force_eeprom_read=0

#Enable devicetree overlays
dtparam=spi=on
enable_uart=1
dtparam=i2c_arm=on

dtoverlay=v-link
dtoverlay=uart3
dtoverlay=mcp2515-can1,oscillator=16000000,interrupt=24
dtoverlay=mcp2515-can2,oscillator=16000000,interrupt=22

#Configure IGN logic
dtoverlay=gpio-shutdown,active_low=0,gpio_pull=up,gpio_pin=1
dtoverlay=gpio-poweroff,gpiopin=0

#No Splash on boot
disable_splash=1
EOF'
    fi
fi

# Step 7: Create V-Link systemd service
if confirm_action "create systemd services for V-Link"; then
    sudo bash -c "cat > /etc/systemd/system/v-link.service <<EOF
[Unit]
Description=V-Link Services
After=network.target

[Service]
Type=oneshot
ExecStartPre=/bin/bash -c '/usr/sbin/ip link set can0 down || true; /usr/sbin/ip link set can1 down || true'
ExecStart=/bin/bash -c '/usr/sbin/modprobe uinput; /usr/sbin/ip link set can0 up type can bitrate 500000; /usr/sbin/ip link set can1 up type can bitrate 125000'
ExecStop=/bin/bash -c '/usr/sbin/ip link set can0 down; /usr/sbin/ip link set can1 down'
RemainAfterExit=true

[Install]
WantedBy=multi-user.target
EOF"
        sudo systemctl enable v-link.service && systemctl daemon-reload
fi

# Step 8: Create V-Link udev rules
if confirm_action "create udev rules for V-Link"; then
    echo "Creating combined udev rule"
    RULE_FILE=/etc/udev/rules.d/42-v-link.rules

    # Write all rules into a single file
    echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="1314", ATTR{idProduct}=="152*", MODE="0660", GROUP="plugdev"' | sudo tee $RULE_FILE
    echo 'KERNEL=="ttyS0", MODE="0660", GROUP="plugdev"' | sudo tee -a $RULE_FILE
    echo 'KERNEL=="uinput", MODE="0660", GROUP="plugdev"' | sudo tee -a $RULE_FILE

    if [[ $? -eq 0 ]]; then
        echo -e "Permissions created\n"
    else
        echo -e "Unable to create permissions\n"
    fi
fi

# Step 9: Create autostart file for V-Link
if confirm_action "create autostart file for V-Link"; then
    output_path="/home/$CURRENT_USER/v-link"

    sudo bash -c "cat > /etc/xdg/autostart/v-link.desktop <<EOL
[Desktop Entry]
Name=V-Link
Exec=sh -c 'sudo systemctl restart v-link.service && python $output_path/V-Link.py'
Type=Application
EOL"
fi

# Step 10: Enable sudo permission for systemctl restart
if confirm_action "enable V-Link to restart v-link.service as sudo"; then
    SERVICE_NAME="v-link"
    SUDOERS_FILE="/etc/sudoers.d/$SERVICE_NAME"
    CURRENT_USER=$(whoami)

    # Check if the sudoers file already exists
    if [[ -f "$SUDOERS_FILE" ]]; then
        echo "Sudoers file for $SERVICE_NAME already exists at $SUDOERS_FILE. Skipping creation."
    else
        echo "Creating sudoers rule for user '$CURRENT_USER' to restart '$SERVICE_NAME'..."

        # Write the rule to a new sudoers file
        {
            echo "# Allow $CURRENT_USER to restart $SERVICE_NAME without a password"
            echo "$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart $SERVICE_NAME.service"
        } > "$SUDOERS_FILE"

        # Validate the sudoers file syntax
        if visudo -c -f "$SUDOERS_FILE" &>/dev/null; then
            echo "Sudoers rule added successfully in $SUDOERS_FILE."
            sudo chmod 0440 /etc/sudoers.d/$SERVICE_NAME
        else
            echo "Error: Sudoers rule syntax is invalid. Aborting."
            rm -f "$SUDOERS_FILE"
            exit 1
        fi
    fi
fi

# Step 11: Remove logo and cursor on boot
if confirm_action "boot the raspberry without logo"; then
    FILE="/boot/firmware/cmdline.txt"

    # Text to append
    APPEND_TEXT="logo.nologo vt.global_cursor_default=0"

    # Ensure the file exists
    if [[ ! -f "$FILE" ]]; then
        echo "Error: File $FILE does not exist."
        exit 1
    fi

    sudo sed -i "1{s/$/ $APPEND_TEXT/}" "$FILE"
fi

# Step 12: Prompt to reboot the system
if confirm_action "reboot the system now to apply the changes"; then
    setup_complete
    sudo reboot
else
    echo "Reboot was skipped. Please reboot manually to apply the changes."
    setup_complete
fi