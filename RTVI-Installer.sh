#!/bin/bash
echo "Installing Volvo RTVI"

while true; do
    read -p "Update System? (Recommended) [Y/N]" yn
    case $yn in
        [Yy]* ) sudo apt-get update; sudo apt-get upgrade; break;;
        [Nn]* ) break;;
        * ) echo "Answer with Y or N";;
    esac
done

while true; do
    read -p "Install Prerequisites? (Recommended) [Y/N]" yn
    case $yn in
        [Yy]* ) sudo apt-get install ffmpeg; sudo apt-get install libudev-dev; break;;
        [Nn]* ) break;;
        * ) echo "Answer with Y or N";;
    esac
done

# Check if Python is installed
if command -v python3 &>/dev/null; then
    echo "Python is already installed."
else
    read -p "Python is not installed. Do you want to install it? [Y/N]" yn
    case $yn in
        [Yy]* ) sudo apt-get install python3; break;;
        [Nn]* ) echo "Python is required. Exiting."; exit;;
        * ) echo "Y/N:";;
    esac
fi

# Check if pip is installed
if command -v pip3 &>/dev/null; then
    echo "pip is already installed."
else
    read -p "pip is not installed. Do you want to install it? [Y/N]" yn
    case $yn in
        [Yy]* ) sudo apt-get install python3-pip; break;;
        [Nn]* ) echo "pip is required. Exiting."; exit;;
        * ) echo "Y/N:";;
    esac
fi

while true; do
    read -p "Install Volvo RTVI? [Y/N]" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Y/N:";;
    esac
done


# Create udev rule that grants access to carlinkit device and ttys0
echo "Creating udev rules"

# USB device rule
USB_RULE_FILE=/etc/udev/rules.d/52-volvo-rtvi-usb.rules
echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="1314", ATTR{idProduct}=="152*", MODE="0660", GROUP="plugdev"' | sudo tee $USB_RULE_FILE

# Serial port rule
SERIAL_RULE_FILE=/etc/udev/rules.d/52-volvo-rtvi-serial.rules
echo 'KERNEL=="ttyS0", MODE="0660", GROUP="plugdev"' | sudo tee $SERIAL_RULE_FILE

if [[ $? -eq 0 ]]; then
    echo -e "Permissions created\n"
else
    echo -e "Unable to create permissions\n"
fi


echo "Downloading volvo-rtvi"
curl -L https://github.com/LRYMND/volvo-rtvi/releases/download/ --output /home/$USER/volvo-rtvi

# Install python backend (Required)
echo "Installing volvo-rtvi backend"
python3 -m venv /home/$USER/volvo-rtvi/backend
source /home/$USER/volvo-rtvi/backend/bin/activate
python3 -m pip install -r /home/$USER/volvo-rtvi/backend/requirements.txt
deactivate

while true; do
    read -p "Create autostart file for Volvo RTVI? [Y/N]" yn
    case $yn in
        [Yy]* ) sudo bash -c "echo '[RTVI Entry]
                Name=File Manager
                Exec=/home/$USER/volvo-rtvi/scripts/run.sh
                Type=Application' > /etc/xdg/autostart/volvo-rtvi.desktop"
                ;;
        [Nn]* ) exit;;
        * ) echo "Answer with Y or N";;
    esac
done

echo "All Done"

while true; do
    read -p "Do you want to start the Application now? [Y/N]" yn
    case $yn in
        [Yy]* ) /home/$USER/volvo-rtvi/scripts/run.sh;;
        [Nn]* ) exit;;
        * ) echo "Y/N:";;
    esac
done
