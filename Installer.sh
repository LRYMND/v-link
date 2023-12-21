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

echo "Install Volvo RTVI?"

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



# Set the download URL and output path
download_url="https://github.com/LRYMND/volvo-rtvi/releases/download/v2.0.0/Volvo-RTVI.zip"
output_path="/home/$USER/volvo-rtvi"

# Download the file
echo "Downloading files to: $output_path"
mkdir -p $output_path
curl -L $download_url --output $output_path/Volvo-RTVI.zip

# Unzip the contents
echo "Unzipping the contents..."
unzip $output_path/Volvo-RTVI.zip -d $output_path

# Change to the directory
cd $output_path

# Install requirements
requirements="/home/$USER/volvo-rtvi/backend/requirements.txt"
echo "Installing requirements..."
pip3 install -r $requirements
echo
echo
# Provide some feedback
echo "Volvo-RTVI installation completed."

echo
echo

while true; do
    read -p "Create autostart file for Volvo RTVI? [Y/N]" yn
    case $yn in
        [Yy]* ) 
            sudo bash -c "cat > /etc/xdg/autostart/volvo-rtvi.desktop <<EOL
[Desktop Entry]
Name=Volvo RTVI
Exec=python3 /home/$USER/volvo-rtvi/Volvo-RTVI.py
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
            python3 /home/$USER/volvo-rtvi/Volvo-RTVI.py
            ;;
        [Nn]* ) 
            exit;;
        * ) 
            echo "Y/N:";;
    esac
done

