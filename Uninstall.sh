#!/bin/bash

# V-Link Uninstaller - https://www.github.com/lrymnd/v-link

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

# Function to remove a file or directory if it exists
remove_if_exists() {
    if [ -e "$1" ]; then
        echo "Removing: $1"
        sudo rm -rf "$1"
    else
        echo "$1 not found, skipping."
    fi
}

echo "Uninstalling V-Link"
sudo -v  # This will prompt the user for their password upfront

# Step 1: Remove application files
if confirm_action "remove all application files"; then
    remove_if_exists "/home/$USER/v-link"
fi

# Step 2: Remove vlink.dtbo, mcp2515-can1, and mcp2515-can2 from /boot/firmware/overlays
if confirm_action "remove entries from /boot/firmware/overlays"; then
    remove_if_exists "/boot/firmware/overlays/vlink.dtbo"
    remove_if_exists "/boot/firmware/overlays/mcp2515-can1.dtbo"
    remove_if_exists "/boot/firmware/overlays/mcp2515-can2.dtbo"
fi

# Step 3: Remove all entries from /etc/network/interfaces related to vlink
if confirm_action "remove entries from /etc/network/interfaces"; then
    sudo sed -i '1,/$/d' /etc/network/interfaces
fi

# Step 4: Remove v-link.desktop from /etc/xdg/autostart
if confirm_action "remove entries from /etc/xdg/autostart"; then
    remove_if_exists "/etc/xdg/autostart/v-link.desktop"
fi

# Step 5: Remove vlink.service from /etc/systemd/system
if confirm_action "remove entries from /etc/systemd/system"; then
    remove_if_exists "/etc/systemd/system/vlink.service"
fi

# Step 6: Remove entries from /boot/firmware/config.txt starting with [V-Link and ending with disable_splash=1
if confirm_action "remove entries from /boot/firmware/config.txt"; then
    sudo sed -i '/\[V-LINK/,/disable_splash=1/d' /boot/firmware/config.txt
fi

echo "Uninstall complete."
