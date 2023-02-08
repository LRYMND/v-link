#!/bin/bash

#create udev rule thats specific to carlinkit device
echo "Creating udev rules"

FILE=/etc/udev/rules.d/52-nodecarplay.rules
echo "SUBSYSTEM==\"usb\", ATTR{idVendor}==\"1314\", ATTR{idProduct}==\"152*\", MODE=\"0660\", GROUP=\"plugdev\"" | sudo tee $FILE

if [[ $? -eq 0 ]]; then
	echo -e Permissions created'\n'
    else
	echo -e Unable to create permissions'\n'
fi

