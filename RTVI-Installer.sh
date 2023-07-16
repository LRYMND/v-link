#!/bin/bash
echo "Installing Volvo RTVI 1.3.0"

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
        [Yy]* ) sudo apt-get install ffmpeg; sudo apt-get install libudev-dev; pip install python-can; break;;
        [Nn]* ) break;;
        * ) echo "Answer with Y or N";;
    esac
done

while true; do
    read -p "Install Volvo RTVI? [Y/N]" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Answer with Y or N";;
    esac
done

#Set path to copy appimage and autolaunch location
path="/home/pi/RTVI.AppImage"

#create udev rule thats specific to carlinkit device
echo "Creating udev rules"

FILE=/etc/udev/rules.d/52-rtvi.rules
echo "SUBSYSTEM==\"usb\", ATTR{idVendor}==\"1314\", ATTR{idProduct}==\"152*\", MODE=\"0660\", GROUP=\"plugdev\"" | sudo tee $FILE

if [[ $? -eq 0 ]]; then
	echo -e Permissions created'\n'
    else
	echo -e Unable to create permissions'\n'
fi

echo "Downloading RTVI v1.3.0"
while true; do
    read -p "Download 64bit version? [Y/N]" yn
    case $yn in
        [Yy]* ) curl -L https://github.com/LRYMND/volvo-rtvi/releases/download/v1.3.0/Volvo_RTVI-1.3.0-armv64.AppImage --output /home/pi/RTVI.AppImage; break;;
        [Nn]* ) curl -L https://github.com/LRYMND/volvo-rtvi/releases/download/v1.3.0/Volvo_RTVI-1.3.0-armv7l.AppImage --output /home/pi/RTVI.AppImage; break;;
        * ) echo "Answer with Y or N";;
    esac
done

echo "Installing"
sudo chmod +x /home/pi/RTVI.AppImage

echo "Creating Autostart Entry"

sudo bash -c "echo '[RTVI Entry]
Name=File Manager
Exec=/home/pi/Desktop/RTVI.AppImage
Type=Application' > /etc/xdg/autostart/rtvi.desktop"

echo "All Done"

while true; do
    read -p "Do you want to start the Application now? [Y/N]" yn
    case $yn in
        [Yy]* ) /home/pi/RTVI.AppImage --no-sandbox;;
        [Nn]* ) exit;;
        * ) echo "Answer with Y or N";;
    esac
done
