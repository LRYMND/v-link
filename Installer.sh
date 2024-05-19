#!/bin/bash

echo "Installing V-Link"

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
        [Yy]* ) sudo apt-get install ffmpeg; sudo apt-get install libudev-dev; sudo apt-get install libusb-dev; sudo apt-get install build-essential; break;;
        [Nn]* ) break;;
        * ) echo "Answer with Y or N";;
    esac
done

# Check if Python is installed
if command -v python &>/dev/null; then
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
if command -v pip &>/dev/null; then
	echo "pip is already installed."
else
    read -p "pip is not installed. Do you want to install it? [Y/N]" yn
    case $yn in
        [Yy]* ) sudo apt-get install python3-pip; break;;
        [Nn]* ) echo "pip is required. Exiting."; exit;;
        * ) echo "Y/N:";;
    esac
fi

echo "Install Volvo V-Link?"

while true; do
    read -p "[Y/N]" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Y/N:";;
    esac
done


# Create udev rule that grants access to carlinkit device and ttys0
echo "Creating udev rules"

# USB device rule
USB_RULE_FILE=/etc/udev/rules.d/52-v-link-usb.rules
echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="1314", ATTR{idProduct}=="152*", MODE="0660", GROUP="plugdev"' | sudo tee $USB_RULE_FILE

# Serial port rule
SERIAL_RULE_FILE=/etc/udev/rules.d/52-v-link-serial.rules
echo 'KERNEL=="ttyS0", MODE="0660", GROUP="plugdev"' | sudo tee $SERIAL_RULE_FILE

if [[ $? -eq 0 ]]; then
    echo -e "Permissions created\n"
else
    echo -e "Unable to create permissions\n"
fi



# Set the download URL and output path
download_url="https://github.com/LRYMND/v-link/releases/download/v2.1.0/V-Link.zip"
output_path="/home/$USER/v-link"

# Download the file
echo "Downloading files to: $output_path"
mkdir -p $output_path
curl -L $download_url --output $output_path/V-Link.zip

# Unzip the contents
echo "Unzipping the contents..."
unzip $output_path/V-Link.zip -d $output_path

# Change to the directory
cd $output_path

while true; do
    read -p "Setup virtual environment? (Recommended) [Y/N]" yn
    case $yn in
        [Yy]* ) 
            if [ -d "venv" ]; then
                echo "Virtual environment already exists. Activating it..."
                . venv/bin/activate
            else
                echo "Creating virtual environment..."
                python3 -m venv venv
                . venv/bin/activate
            fi
            break
            ;;
        [Nn]* ) break;;
        * ) echo "Answer with Y or N";;
    esac
done

# Install requirements
requirements="/home/$USER/V-Link/requirements.txt"
echo "Installing requirements..."
pip3 install -r $requirements
echo
echo
# Provide some feedback
echo "V-Link installation completed."

echo
echo

while true; do
    read -p "Create autostart file for V-Link? [Y/N]" yn
    case $yn in
        [Yy]* ) 
            sudo bash -c "cat > /etc/xdg/autostart/v-link.desktop <<EOL
[Desktop Entry]
Name=V-Link
Exec=python3 /home/$USER/v-link/V-Link.py
Type=Application
EOL"
            break;;
        [Nn]* ) 
            break;;
        * ) 
            echo "Answer with Y or N";;
    esac
done


echo "All Done"

while true; do
    read -p "Do you want to start the Application now? [Y/N]" yn
    case $yn in
        [Yy]* ) 
            python3 /home/$USER/v-link/V-Link.py
            ;;
        [Nn]* ) 
            exit;;
        * ) 
            echo "Y/N:";;
    esac
done