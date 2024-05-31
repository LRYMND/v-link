![TITLE IMAGE](repo/media/banner.png?raw=true "Banner")  
![PAGES IMAGE](repo/media/pages.jpg?raw=true "Pages")  
The Volvo V-Link project aims to implement Apple CarPlay / Android Auto as well as live vehicle information in an OEM-like fashion. The backbone of the project is the V-Link app which runs natively on RaspberryPi OS. This enables full support of an operating system without the need of installing any 3rd party images which would limit the capabilites of the Raspberry. A custom-made PCB builds the interface between the app and the car. Further information can be found down below.

![PAGES IMAGE](repo/media/v_link.jpg?raw=true "V-Link") 

Want to join development, got any tips for improvement or need help?  

* [Swedespeed Forum](https://www.swedespeed.com/threads/volvo-rtvi-raspberry-media-can-interface.658254/)
* [V-Link Discord Server](https://discord.gg/V4RQG6p8vM)

## Content

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li><a>| Installation</a></li>
    <li><a>| V-Link Setup</a></li>
    <li><a>| Display Mod</a></li>
    <li><a>| Wiring</a></li>
    <li><a>| Audio</a></li>
    <li><a>| Disclaimer</a></li>
    <li><a>| Roadmap</a></li>
  </ol>
</details>

---

## 01 | Installation

### > System Requirements:
```
Raspbian 11 Bullseye
Chromium 116
Python 3.9.2
```

---

### > Run the App:
```
#Download and Install
wget "https://github.com/LRYMND/v-link/releases/download/v2.1.0/Installer.sh"
chmod +x Installer.sh
./Installer.sh

#Test Hardware (Requires V-Link HAT)
python3 /home/$USER/v-link/HWT.py

#Execute
python3 /home/$USER/v-link/V-Link.py
```

#### When updating the app, please remove any entries from these locations:
```
/etc/network/interfaces
/etc/xdg/autostart/
/home/$USER/.config

/boot/config.txt (RaspberryPi 4)
/boot/firmware/config.txt (RaspberryPi 5)
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
pip install -r requirements.txt
cd frontend
npm i & npm run build

cd /home/$USER/v-link/frontend
npm run vite

cd /home/$USER/v-link
python3 V-Link.py dev
```

```
Node v18.12.1
NPM 8.19.2
```

#### Entries in /boot/config.txt:

```
[V-LINK]

#Enable GPIO 0&1
disable_poe_fan=1
force_eeprom_read=0

#Enable devicetree overlays
dtparam=i2c_arm=on
dtoverlay=vlink
dtoverlay=mcp2515-can1,oscillator=16000000,interrupt=24
dtoverlay=mcp2515-can2,oscillator=16000000,interrupt=22

#Configure IGN logic
dtoverlay=gpio-shutdown,active_low=0,gpio_pull=up,gpio_pin=1
dtoverlay=gpio-poweroff,gpiopin=0

#No Splash on boot
disable_splash=1
```
*(Don't forget to copy the custom overlays from the devicetree folder of this repository to /boot/overlays!)*

## 02 | V-Link Setup

Here you can find a list of the required hardware. The V-Link Hat is currently not being sold. If you are interested in how to get one I encourage you getting in contact via our Discord channel! The old method which involved more hardware and technical skill is documented further down below. 

#### Mandatory:
- V-Link Hat
- Raspberry Pi 4/5
- OEM P1 RTI Display Unit
- Carlinkit Adapter

 As of now, Carplay is working reliably on the CPC200-CCPA while Android Auto works better on the CPC200-CCPM Dongle. In theory, Android Auto should work on the CCPA version as well but we had mixed results. Keep this in mind when choosing your Carlinkit Adapter.

#### Optional:

* [LCD Driver](https://de.aliexpress.com/item/4001175095149.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [LCD Display](https://de.aliexpress.com/item/32835602509.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [6.5" Touch Screen Module](https://www.ebay.de/itm/170981315406)


If you want to use the original display, you can find a way to do so in the repositories from laurynas, however, its highly recommended to go the extra mile as it has a much better resolution and also supports touch input with an additional panel.

![PAGES IMAGE](repo/schematics/installation_new.png?raw=true "V-Link Setup")  

The V-Link Hat is attached to the Raspberry and builds the interface to the car. On this PCB you have terminals to hook up 12V, IGN, CAN etc. It also implements a safe shutdown functionality which gracefully turns off the Raspberry once ignition is off. In this state it draws a minimum of current so draining your cars battery won‘t be an issue. The LCD Touch Display and the Carlinkit Adapter are plugged into the HDMI / USB port of the raspberry and complete the setup.

### > DIY Instructions

In case you want to avoid the HAT and build the setup from scratch, please refer to branch 2.0.0 which includes the old schematics and installation instructions!


## 03 | Display Mod

In order to mod your display to get a better resolution and touch support, you need to disassemble the case and take the OEM components out. Afterwards mount the new Screen in place. A custom 3D-printable bracket for easy installation is currently in the making!

## 04 | Wiring

### > 4.1 Main Connections

One way to connect the HAT to the car is to wire it to the CEM. You can solder - or better re-crimp - the wires directly to the connector. That way you aren't splicing any harnesses and the mod can be undone without damaging anything. The idea is to have an additional harness to the HAT. Keep in mind to choose appropriate diameters for you wire so they can carry the load and still fit in the connector. This is especially critical with the CAN wiring. In the future we want to make this a bit more easy.

The connections below are the bare minimum for the app to function properly:

```
| Connection  | CEM Connector | Pin | HAT     |
| ----------- | ------------- | --- | ------- |
| CAN-H       | B             | 11  | CAN 1 H |
| CAN-L       | B             | 12  | CAN 1 L |
| GND         | A             | 28  | GND     |
| IGN         | A             | 17  | IGN     |
| 12V         | E             | 21  | VBAT    |
```

![HAT SCHEMATIC](repo/schematics/hat_1.0.jpg?raw=true "HAT Schematic")

![EWD SCHEMATIC](repo/media/ewdschematic.jpg?raw=true "EWD Schematic")
(Borrowed from the original Volvo Electronic Wiring Diagrams)



### > 4.2 Steering Wheel Controls (WIP)

In order to implement the steering wheel controls, you need to connect the HAT to the LIN bus of your car. The app will convert the signals from the sw buttons to keyboard/mouse HID events.

The easiest place to find the LIN Bus is the "ICM Connector A" behind the waterfall. Either connect a DuPont wire to the associated pin or disassemble the ICM and solder a small wire to it.

 ![ICM_CONNECTOR_IMAGE](repo/media/icm_connector.jpg?raw=true "LIN Connector")

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

Holding down 'prev' button for 2 seconds toggles between normal and mouse mode. The button mappings, timeouts etc can be adjusted in the settings file.

---

### > 4.3 RTI folding mechanism

Connect RTI_TX_PIN to the Serial pin of the HAT. Again, either use a DuPont wire or solder directly to the RTI PCB/connector. Don't forget to also connect pin 7 (GND) to a common grounding point.

![RTI_CONNECTOR_IMAGE](repo/media/rti_connector.jpg?raw=true "RTI Connector")

When ignition is turned on, the RTI screen automatically folds up and you can use the joystick on the back of the steering wheel to navigate through CarPlay. When clicking on the 'Enter' button on the back of the steering wheel, the Arduino sends an ASCII 'space' event (spacebar) to navigate the app. (CarPlay requires this instead of a left click or a return/enter)

---

### > 4.4 Additonal Peripherals

The HAT has an input for up to 4 analog sensors. A preconfigured settings file for the Bosch 0261230482 sensor kit is provided and enables temperature and pressure readings in the app. The settings file for the analogue sensors are exposed like the CAN settings, so sensors can be added without making any changes to the code at all.

Also, to make life a bit easier, you can connect an USB extension cable to the Raspi and mount it to the removable tray behind the waterfall console. This way you can directly connect peripherals to it.

![USB IMAGE](repo/media/usb.jpg?raw=true "USB")

## 05 | Audio

The current solution for getting audio to work in cars, which don't have a factory aux port, is a [small module](https://www.tindie.com/products/justtech/aux-input-volvo-v50-s40-c30-c70-xc90/) from Lithuania.
This module is a mod for the radio to add an aux port. There is also a Bluetooth version available but since the phone is already wirelessly connected to the Carlinkit adapter dongle, an aux-cable seems pretty clean and less prone to failure.

### > Note:

This is no advertisement, just a clean and simple solution IMO. And since MOST-Bus is supported through the PiMost from ModernDayMods, it might be possible to send audio over the MOST network in the future. This is still under investigation. Feel free to join the Discord Server if you want to participate in development.

In the future we want to integrate MOST Bus into the project for a better audio quality and easier installation. Stay tuned.

## 06 | Disclaimer

I distance myself from any damage that you might do to your car in case you want to follow this guide. Eventually you will need to find other places to mount your components and different paths to route your cables; it's DIY afterall!

## 07 | Roadmap

- [x] Reimplement LIN interface
- [x] Integrate ADC functionality
- [x] Improve hardware and installation
- [ ] 3D-printed display mount
- [ ] Improve wiring to the car
- [ ] Integrate DTC functionality
- [ ] Integrate MOST-bus

---

![CARPLAY](repo/media/carplay.jpg?raw=true "Carplay") 

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


































