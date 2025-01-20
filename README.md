![TITLE IMAGE](resources/media/banner.jpg?raw=true "Banner")  
  
## Welcome to the Boosted Moose V-Link project!

Let's face it. MMIs from the 2000s suck. This is a personal project that I started because I couldn't find a suitable aftermarket solution. I wanted to implement live vehicle data as well as AndroidAuto/Apple CarPlay in an OEM like fashion to enhance the driving experience of retro cars and give the user the ability to tinker around. The heart of this project is the open source V-Link app. It's running natively on Raspberry Pi OS which enables full support of an OS without the restrictions of 3rd party images. A custom made HAT builds the bridge between the Raspberry Pi and the car and works plug and play with the app.

To use this application you need a Raspberry Pi, the V-Link Hat (optional) and an HDMI-screen, preferably with touch support.

This project is in ongoing development. Do you want to participate, got any tips for improvement or need help?

* [Swedespeed Forum](https://www.swedespeed.com/threads/volvo-rtvi-raspberry-media-can-interface.658254/)
* [V-Link Discord Server](https://discord.gg/V4RQG6p8vM)

Feel free to fork the project. Create a new branch, commit your changes and open a pull request.

## Content

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li><a>| App Installation</a></li>
    <li><a>| HAT Setup</a></li>
    <li><a>| Display Mod</a></li>
    <li><a>| Wiring</a></li>
    <li><a>| Audio</a></li>
    <li><a>| Disclaimer</a></li>
    <li><a>| Known Issues</a></li>
    <li><a>| Roadmap</a></li>
  </ol>
</details>

---

## 01 | App Installation

### > System Requirements:
```
Running on Raspberry Pi 3/4/5
Raspberry Pi OS 12 (Bookworm)
```

For the best user experience a RPi 4 or 5 is recommended.

---

### > Run the App:

When using the Installer everything is being set up automatically.
Before updating, please uninstall the app. (See below)

```
#Download and Install
wget "https://github.com/LRYMND/v-link/releases/download/v2.2.1/Installer.sh"
sudo chmod +x Installer.sh
sudo ./Installer.sh

#Test Hardware (Requires V-Link HAT)
python /home/$USER/v-link/HWT.py

#Execute
python /home/$USER/v-link/V-Link.py

#Advanced Options:
python /home/$USER/v-link/V-Link.py -h
```

#### In case you get an error when installing the requirements run these commands:
```
source /home/$USER/v-link/venv/bin/activate
pip install -r /home/$USER/v-link/requirements.txt
```
---

### > Run as Developer:
```
git clone https://github.com/lrymnd/v-link.git
cd v-link
python -m venv venv
source /home/$USER/v-link/venv/bin/activate
pip install -r requirements.txt
cd frontend
npm i & npm run build

cd /home/$USER/v-link/frontend
npm run vite

cd /home/$USER/v-link
python V-Link.py -h
```

```
Node v18.12.1
NPM 8.19.2
```

### > Uninstall:
```
cd ~/home/$USER/v-link/
sudo chmod +x Uninstall.sh
./Uninstall.sh
```

The Uninstall.sh script removes entries from the following location. However this is only supported from 2.2.0 onwards.
Earlier installations need to be removed manually.

```
/etc/udev/rules.d/
/etc/xdg/autostart/
/etc/network/interfaces
/home/$USER/.config
/boot/firmware/config.txt
/etc/systemd/system/
/etc/sudoers.d/
```

### > Additional functionality:

CAN and ADC data can be recorded from the chart dashboard. This data can be downloaded and evaluated with plotter.py from the /resources/tools/ folder.

```
python plotter.py $PATH_TO_JSON
```

#### Entries in /boot/firmware/config.txt:

```
[V-LINK RPi3]

#Enable GPIO 0&1
disable_poe_fan=1
force_eeprom_read=0

#Enable devicetree overlays
dtoverlay=disable-bt
enable_uart=1

dtparam=i2c_arm=on
dtoverlay=v-link
dtoverlay=mcp2515-can1,oscillator=16000000,interrupt=24
dtoverlay=mcp2515-can2,oscillator=16000000,interrupt=22

#Configure IGN logic
dtoverlay=gpio-shutdown,active_low=0,gpio_pull=up,gpio_pin=1
dtoverlay=gpio-poweroff,gpiopin=0

#No Splash on boot
disable_splash=1
```

```
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
```

```
[V-LINK RPi5]

#Enable GPIO 0&1
disable_poe_fan=1
force_eeprom_read=0

#Enable devicetree overlays
dtparam=spi=on
enable_uart=1
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
```
*(Don't forget to copy the custom overlays from the devicetree folder of this repository to /boot/firmware/overlays!)*

#### Further Setup:

When installing everything manually you need to set up certain features. Below you can find a list of commands to enable all necessary ports and access rights:

Enabling CAN:
```
sudo ip link set can1 type can bitrate 500000
sudo ip link set up can1

sudo ip link set can2 type can bitrate 125000
sudo ip link set up can2
```

Enabling uinput & vcan:
```
sudo modprobe uinput
sudo modprobe vcan
```

Rules for /etc/udev/rules.d/42-v-link.rules:
```
SUBSYSTEM=="usb", ATTR{idVendor}=="1314", ATTR{idProduct}=="152*", MODE="0660", GROUP="plugdev"
KERNEL=="ttyS0", MODE="0660", GROUP="plugdev"
KERNEL=="uinput", MODE="0660", GROUP="plugdev"
```

## 02 | HAT Setup

Here you can find a list of the required hardware. The V-Link HAT is currently only being sold in small batches to interested ones. If you are interested in how to get one I encourage you getting in contact via Discord! The old method which involved more hardware and technical skill is archived in the 2.0.0 branch of this repo. 

#### Hardware:
- V-Link HAT
- Raspberry Pi 3/4/5
- OEM P1 RTI Display Unit
- Carlinkit Adapter

##### CarPlay / AndroidAuto:
As of now, Carplay is working reliably on the CPC200-CCPA while AndroidAuto works better on the CPC200-CCPM Dongle. In theory, Android Auto should work on the CCPA version as well but we had mixed results. Keep this in mind when choosing your Carlinkit Adapter.

##### Raspberry Pi 3:
The Raspberry Pi 3 comes with only two UART ports. In order to use the RTI functionality you will need to place a jumper between GPIO4 and GPIO14 and short them together. Your GPIO pins won't be damaged through this and the signal arrives at the terminal of the HAT.

![INSTALLATION](resources/schematics/installation.png?raw=true "Installation")  

The V-Link HAT is attached to the Raspberry and builds the interface to the car. On this PCB you have terminals to hook up 12V, IGN, CAN etc. It also implements a safe shutdown functionality which gracefully turns off the Raspberry once ignition is off. In this state it draws a minimum of current so draining your cars battery won‘t be an issue. The LCD Touch Display and the Carlinkit Adapter are plugged into the HDMI / USB port of the raspberry and complete the setup.

## 03 | Display Mod

We currently investigate the possibility of using the OEM LCD unit, however it's recommended to go the extra mile as the proposed display has a much better resolution and supports touch input with an additional panel. The HAT comes with a dedicated 5V pin on the power terminal to run the LCD.

* [LCD Driver](https://de.aliexpress.com/item/4001175095149.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [LCD Display](https://de.aliexpress.com/item/32835602509.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [6.5" Touch Screen Module](https://www.ebay.de/itm/170981315406)

In order to mod your display you need to disassemble the case and take the OEM components out. Afterwards mount the new Screen in place. A custom 3D-printable bracket for easy installation can be found in the /resources folder. Be aware that the the LCDs from aliexpress come in different thicknesses. Unfortunately you can't really determine which one you're getting but if you have the option go for the slimmest variant.

![DISPLAY MOUNT](resources/media/display_mount.jpg?raw=true "Display Mount")

## 04 | Wiring

### > 4.1 Main Connections

One way to connect the HAT to the car is to wire it to the CEM. You can solder - or better re-crimp - the wires directly to the connector. That way you aren't splicing any harnesses and the mod can be undone without damaging anything. The idea is to have an additional harness to the HAT. Keep in mind to choose appropriate diameters for you wire so they can carry the load and still fit in the connector. This is especially critical with the CAN wiring. In the future we want to make this a bit more easy.

![HAT SCHEMATIC](resources/schematics/layout.png?raw=true "HAT Schematic")

![EWD SCHEMATIC](resources/schematics/cem.png?raw=true "EWD Schematic")
(Borrowed from the original Volvo Electronic Wiring Diagrams)

The connections below are the bare minimum for the app to function properly on the Volvo P1 platform:

```
| Connection  | CEM Connector | Pin | HAT     |
| ----------- | ------------- | --- | ------- |
| CAN-H HS    | B             | 11  | CAN 1 H |
| CAN-L HS    | B             | 12  | CAN 1 L |
| GND         | A             | 28  | GND     |
| IGN         | A             | 17  | IGN     |
| 12V         | E             | 21  | VBAT    |
```

### > 4.2 Steering Wheel Controls (WIP)

In order to implement the steering wheel controls, you need to connect the HAT to the LIN bus of your car. The app will convert the signals from the steering wheel buttons to keyboard/mouse HID events. The easiest place to find the LIN Bus is the "ICM Connector A" behind the waterfall. Disassemble the ICM and solder a small wire to it as shown in the picture below, or add a small wire to the ICM's wiring harness.

 ![ICM_CONNECTOR_IMAGE](resources/schematics/icm.png?raw=true "ICM PCB")

#### Control folding mechanism:
```
| Button  | Function                  |
| ------- | ------------------------- |
| 'back'  | Hold down to close screen |
| 'enter' | Click to open screen      |
```
#### Control interface:
```
| Button     | Normal Mode | Mouse Mode         |
| ---------- | ----------- | ------------------ |
| 'Enter'    | Enter       | Left Click         |
| 'Joystick' | Navigate    | Control mouse      |
```

Holding down `Enter` button for ~2 seconds toggles between normal and mouse mode. The button mappings can be adjusted in the app.

---

### > 4.3 RTI folding mechanism

Connect Pin 4 from the RTI to the RTI pin of the HAT. You can solder directly to the RTI PCB/connector, or you can plug a DuPont wire into the connector. This can be done on the RTI side of the cable, or on the other side of the cable in the glove box. 

![RTI_CONNECTOR_IMAGE](resources/schematics/rti.png?raw=true "RTI Connector")

When ignition is turned on, the RTI screen automatically folds up. You can fold it back down through the app or the dedicated steering wheel button. Keep in mind, if your steering wheel module is not connected, you will not be able to bring the screen back up without restarting your car. The LCD will be automatically turned off in the hidden state to save power.

---

### > 4.4 Additonal Peripherals

The HAT has an input for up to 4 analog sensors. A preconfigured settings file for the Bosch 0261230482 sensor kit is provided and enables temperature and pressure readings in the app. The settings file for the analogue sensors are exposed like the CAN settings, so sensors can be added without making any changes to the code at all.

Also, to make life a bit easier, you can connect an USB extension cable to the Raspi and mount it to the removable tray behind the waterfall console. This way you can directly connect peripherals to it.

![USB IMAGE](resources/media/usb.jpg?raw=true "USB")

## 05 | Audio

The current solution for getting audio to work in cars that don't have a factory aux port is a [small module](https://www.tindie.com/products/justtech/aux-input-volvo-v50-s40-c30-c70-xc90/) from Lithuania.
This module is a mod for the radio to add an aux port. There is also a Bluetooth version available but since the phone is already wirelessly connected to the Carlinkit adapter dongle, an aux-cable seems pretty clean and less prone to failure.

### > Note:

This is no advertisement, just a clean and simple solution IMO. And since MOST-Bus is supported through the PiMost from ModernDayMods, it might be possible to send audio over the MOST network in the future. This is still under investigation. Feel free to join the Discord Server if you want to participate in development.

## 06 | Disclaimer

The use of this soft- and hardware is at your own risk. The author and distributor of this project is not responsible for any damage, personal injury, or any other loss resulting from the use or misuse of the setup described above. By using this setup, you agree to accept full responsibility for any consequences that arise from its use. It’s DIY after all!

## 07 | Known Issues

- In a few cases, CarPlay will connect but the stream is not visible. Restarting carplay on the phone resolves this.
- In a few cases, CAN bus communication is not working right away. Restarting the app resolves this.


## 08 | Roadmap

- [x] Exposed setting files
- [x] Fully responsive UI
- [x] Implement LIN
- [x] Implement ADC
- [x] Implement RTI
- [x] Custom hardware interface
- [x] 3D-printed display mount
- [ ] Preconfiguration for different engines
- [ ] Improved wiring to the car
- [ ] Implement DTCs
- [ ] Implement MOST

---
#### The project is inspired by the following repositories:

* [volvo-can-gauge](https://github.com/Alfaa123/Volvo-CAN-Gauge)
* [react-carplay](https://github.com/rhysmorgan134/react-carplay)
* [volvo-crankshaft](https://github.com/laurynas/volvo_crankshaft)
* [volve](https://github.com/LuukEsselbrugge/Volve)
* [volvo-vida](https://github.com/Tigo2000/Volvo-VIDA)

#### Want to join development, got any tips for improvement or need help?  

* [Swedespeed Forum](https://www.swedespeed.com/threads/volvo-rtvi-raspberry-media-can-interface.658254/)
* [V-Link Discord Server](https://discord.gg/V4RQG6p8vM)

---


| [![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/default-orange.png)](https://www.buymeacoffee.com/lrymnd)  | [![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/default-orange.png)](https://www.buymeacoffee.com/tigo) |
|---|---|
| <center>(Louis)</center> | <center>(Tigo)</center> |
