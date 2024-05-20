![TITLE IMAGE](repo/images/banner.png?raw=true "Banner")  
![PAGES IMAGE](repo/media/pages.jpg?raw=true "Pages")  
The Volvo V-Link project aims to implement Apple CarPlay / Android Auto as well as live vehicle information in an OEM-like fashion. The backbone of the project is the V-Link app which runs natively on RaspberryPi OS. This enables full support of an operating system without the need of installing any 3rd party images which would limit the capabilites of the Raspberry. A custom-made PCB builds the interface between the app and the car. Further information can be found down below.

![PAGES IMAGE](repo/media/v_link.jpg?raw=true "V-Link") 


### > Roadmap

- [x] 3D-printed display mount
- [x] Reimplement LIN interface
- [x] Integrate ADC functionality
- [x] Improve hardware and installation
- [ ] Integrate DTC functionality
- [ ] Sniff more CAN messages
- [ ] Integrate MOST-bus

---

## Content

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li><a>| Installation</a></li>
    <li><a>| V-Link Setup</a></li>
    <li><a>| DIY Setup</a></li>
    <li><a>| Display Mod</a></li>
    <li><a>| Wiring</a></li>
    <li><a>| Audio</a></li>
    <li><a>| Disclaimer</a></li>
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

### > /boot/config.txt:
*(Don't forget to copy the custom overlays from the devicetree folder of this repository to /boot/overlays!)*
```
#V-Link Config:

#Enable GPIO 0&1
disable_poe_fan=1
force_eeprom_read=0

#Enable devicetree overlays
dtparam=i2c_arm=on
dtoverlay=vlink
dtoverlay=mcp2515-can1,oscillator=16000000,interrupt=22
dtoverlay=mcp2515-can2,oscillator=16000000,interrupt=24

#Configure IGN logic
dtoverlay=gpio-shutdown,active_low=0,gpio_pull=up,gpio_pin=1
dtoverlay=gpio-poweroff,gpiopin=0

#No Splash on boot
disable_splash=1
```


### > How to use:
Production:
```
#Download and Install
wget "https://github.com/LRYMND/v-link/releases/download/v2.1.0/Installer.sh"
chmod +x Installer.sh
./Installer.sh

#Execute
cd /home/$USER/v-link
python3 V-Link.py
```

Development:
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

---

## 02 | V-Link Setup

Here you can find the list of the required hardware. The V-Link Hat is currently not being sold. If you are interested in how to get one I encourage you getting in contact via our Discord channel! The old method which involved more hardware and technical skill is documented further down below. 

Mandatory:
- V-Link Hat
- Raspberry Pi 4/5
- OEM P1 RTI Display Unit
- Carlinkit Adapter

 As of now, Carplay is working reliably on the CPC200-CCPA while Android Auto works better on the CPC200-CCPM Dongle. In theory, Android Auto should work con the CCPA version as well but we had mixed results. Keep this in mind when choosing your Carlinkit Adapter.

Optional:

* [LCD Driver](https://de.aliexpress.com/item/4001175095149.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [LCD Display](https://de.aliexpress.com/item/32835602509.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [6.5" Touch Screen Module](https://www.ebay.de/itm/170981315406)


If you want to use the original display, you can find a way to do so in the repositories from laurynas, however, its highly recommended to go the extra mile as it has a much better resolution and also supports touch input with an additional panel.

![PAGES IMAGE](repo/images/vlink.png?raw=true "V-Link Setup")  

The V-Link Hat is attached to the Raspberry and builds the interface to the car. On this PCB you have terminals to hook up 12V, IGN, CAN etc. It also implements a safe shutdown functionality which gracefully turns off the Raspberry once ignition is off and removes power from the buck converter. In this state it draws a minimum of current so draining your cars battery won‘t be an issue. The LCD Touch Display and the Carlinkit Adapter are plugged into the HDMI / USB port of the raspberry and complete the setup.

---

## 03 | DIY Setup

In case you want to build the whole circuit yourself, you can follow the old guide. It will provide you a bit more flexibility as you can customize it to your needs but it is also the more challenging approach. There are also other ways to go, like using other Raspberry HATs that provide CAN-Bus etc. but they are not documented here and will also not be supported. Keep in mind that development will focus around the V-Link HAT. More info on this setup can be found in the 2.0.0 branch.

You will need the same components as described above but instead of the V-Link HAT you will need to get the following items:

* Raspberry PSU
* [MCP2003/4 LIN Transceiver](https://www.amazon.de/MCP2003-IC-Schnittstelle-transceiver-MICROCHIP/dp/B01M7NJBTE/ref=sr_1_2?__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2NBRY6101HM25&dib=eyJ2IjoiMSJ9.C5h4bWl2HhNRhowxKLxDkZgHuVlOvuXQqT1mhaR2efhXLeDlkxU6uZ2YR9aT0-pnVmqb5g3fJwEJa2u-d35gzRZ8WyCnkUSyRS43sdXLGKDMzHnq-4tkxZw2UtaAwvLmfaUlDXt6Ub7KYlrUBSnD-HgqHyvHgVWtHevECEf26idQhBr39os-biAKzfo6srrwZ1Wv7R9eQq6w_M_HkdyTnZ5e4rQl02dEstFOIWHuli2uSRkKHg9fBuQM9nPR0SUOOBlDZcTrJeGB4rVglDmV_t7OpkeiDe-Dz42bo5lng1Y.HCdwMb2q3J0ERir1lkWkv_pJL6u7ialaLuLrTP3FwQ4&dib_tag=se&keywords=mcp+2003+lin+transceiver&qid=1716116170&sprefix=mcp+2003+lin+transceiver%2Caps%2C97&sr=8-2)
* [MCP2515 CAN Module](https://www.amazon.de/-/en/Intelligent-Electronics-Receiver-Controller-Development/dp/B07MY2D7TW/ref=sr_1_6?keywords=mcp2515&qid=1662026860&sr=8-6)
* [12V to 5V Buck Converter, 5A](https://www.amazon.de/gp/product/B071ZRXKJY/ref=ppx_yo_dt_b_asin_title_o06_s00?ie=UTF8&psc=1)
* [12V 5A Fuse](https://www.amazon.de/Neuftech%C2%AE-Sicherungshalter-Flachsicherung-Sicherung-wasserdicht/dp/B00UX6NIQE/ref=asc_df_B00UX6NIQE/?tag=googshopde-21&linkCode=df0&hvadid=310359968785&hvpos=&hvnetw=g&hvrand=13883660999016731185&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9043309&hvtargid=pla-561148277227&psc=1&th=1&psc=1&tag=&ref=&adgrpid=62443302395&hvpone=&hvptwo=&hvadid=310359968785&hvpos=&hvnetw=g&hvrand=13883660999016731185&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9043309&hvtargid=pla-561148277227)

The only component that is not readily available is the custom Raspberry Pi power controller. It ensures that the Raspberry boots when the ignition is turned on and  gracefully shuts off via „shutdown  -h“ when ignition is removed. In this state, it will also completely remove power from the buck converter, keeping the current at an absolute minimum to ensure that the cars battery is not drained.

The controller can be handsoldered on a simple through-hole PCB. The parts are pretty common and can be obtained over a number of shops for electrical components. Schematics as well as a gerber file can be found in the schematics folder of this repository. There is also just one CAN Module listed above but you can easily install a second one if you wanted to.

![PAGES IMAGE](repo/images/diy.png?raw=true "DIY Setup")  

---

## 04 | Display Mod

To swap the display, you will have to disassemble your original RTI unit and take the original display components out. Afterwards you will need to mount the touchscreen to your LCD panel and mount the new display/touchscreen unit into the RTI frame. In case you are not using the V-Link HAT, you need to install the buck converter on the back of the display as shown in the image below 

![SCREENMOD IMAGE](repo/media/screenmod.jpg?raw=true "Screen Mod")

---

## 05 | Wiring (WIP - Update needed for HAT)

### > Main Connections

In the installation schematic you can see how you connect everything. Keep the cables longer in the beginning and then shorten everything to the appropriate length once you install the package in your car.

The easiest way is to mount the wires to the pins of the CEM connectors. This way you are not destroying or splicing any harnesses, the pins can be found easily in the documentation and you can rebuild everything back to factory if you decide to undo the mod for whatever reason. The idea is to have a small additional wire harness to run your entire setup. Keep in mind to choose wires that are not too thick so you can put the pin back into the connector. This is especially an issue with the CAN wiring.

You need to make the following connections.
```
| Connection  | Connector | Pin |
| ----------- | --------- | --- |
| CAN-H       | B         | 11  |
| CAN-L       | B         | 12  |
| GND         | A         | 28  |
| IGN         | A         | 17  |
| 12V         | E         | 21  |
```

![EWD SCHEMATIC](repo/media/ewdschematic.jpg?raw=true "EWD Schematic")
(Borrowed from the original Volvo Electronic Wiring Diagrams)

### > Steering Wheel Controls

In order to implement the steering wheel controls, you need to connect the Raspberry to the LIN bus of your car. The app will convert the signals from the sw buttons to keyboard/mouse HID events. Also you will be able to control opening/closing of the RTI screen by sending serial events to the RTI screen module.

The LIN Bus wire must be connected to pin 6 of the LIN bus transceiver labeled "Lbus".

![MCP2004_PINOUT_IMAGE](repo/media/MCP2004_pinout.png?raw=true "LIN Transceiver pinout")


The easiest place to find the LIN Bus is the "ICM Connector A" behind the waterfall. Either connect a DuPont wire to the associated pin or disassemble the ICM and solder a small wire to it.

 ![ICM_CONNECTOR_IMAGE](repo/media/icm_connector.png?raw=true "LIN Connector")


Connect RX, TX and CS from the MCP2004 to LIN_RX_PIN, LIN_TX_PIN and CS_PIN, respectively. After testing, it turned out that it was not necessary to connect the Fault pin to the Arduino. In Laurynas' volvo_linbus repo, this fault pin is connected in the scheme but there is a typo in the code, so it's not used.

### > RTI folding mechanism

Connect RTI_TX_PIN to pin 4 of the RTI unit. Again, either use a DuPont wire or solder directly to the RTI PCB/connector. Don't forget to also connect pin 7 (GND) to the Raspi or another common grounding point.

![RTI_CONNECTOR_IMAGE](repo/media/rti_connector.png?raw=true "RTI Connector")

When ignition is turned on, the RTI screen automatically folds up and you can use the joystick on the back of the steering wheel to navigate through CarPlay. When clicking on the 'Enter' button on the back of the steering wheel, the Arduino sends an ASCII 'space' event (spacebar) to navigate the app. (CarPlay requires this instead of a left click or a return/enter)

### > Using the SW Module

Control folding mechanism:
```
| Button  | Function                  |
| ------- | ------------------------- |
| 'back'  | Hold down to close screen |
| 'enter' | Click to open screen      |

Control interface:

| Button     | Normal Mode | Mouse Mode         |
| ---------- | ----------- | ------------------ |
| 'Enter'    | Enter       | Left Click         |
| 'Joystick' | Navigate    | Control mouse      |
```

Holding down 'prev' button for 2 seconds toggles between normal and mouse mode. The button mappings, timeouts etc can be adjusted in the settings file.

### > Adding Peripherals

![USB IMAGE](repo/media/usb.jpg?raw=true "USB")

To make life a bit easier, you can connect an USB extension cable to the Raspi and mount it to the removable tray behind the waterfall console. This way you can directly connect peripherals to it.


### > Note:

Make sure that you stress-relief all wiring connections and secure them properly with zip ties.

---

![WIRING IMAGE](repo/media/wiring.jpg?raw=true "Wiring")

## 06 | Audio

The current solution for getting audio to work in cars, which don't have a factory aux port, is a [small module](https://www.tindie.com/products/justtech/aux-input-volvo-v50-s40-c30-c70-xc90/) from Lithuania.
This module is a mod for the radio to add an aux port. There is also a Bluetooth version available but since the phone is already wirelessly connected to the Carlinkit adapter dongle, an aux-cable seems pretty clean and less prone to failure.

In the future we want to integrate MOST Bus into the project for a better audio quality and easier installation. Stay tuned.

### > Note:

This is no advertisement, just a clean and simple solution IMO. And since MOST-Bus is supported through the PiMost from ModernDayMods, it might be possible to send audio over the MOST network in the future. This is still under investigation. Feel free to join the Discord Server if you want to participate in development.

---

## 07 | Disclaimer

I distance myself from any damage that you might do to your car in case you want to follow this guide. Eventually you will need to find other places to mount your components and different paths to route your cables; it's DIY afterall!



The project is inspired by the following repositories:

* [volvo-can-gauge](https://github.com/Alfaa123/Volvo-CAN-Gauge)
* [react-carplay](https://github.com/rhysmorgan134/react-carplay)
* [volvo-crankshaft](https://github.com/laurynas/volvo_crankshaft)
* [volve](https://github.com/LuukEsselbrugge/Volve)
* [volvo-vida](https://github.com/Tigo2000/Volvo-VIDA)

Got any tips for improvement or need help?  

* [Swedespeed Forum](https://www.swedespeed.com/threads/volvo-rtvi-raspberry-media-can-interface.658254/)
* [V-Link Discord Server](https://discord.gg/V4RQG6p8vM)

---

Want to support us?  
| [![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/default-orange.png)](https://www.buymeacoffee.com/lrymnd)  | [![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/default-orange.png)](https://www.buymeacoffee.com/tigo) |
|---|---|
| <center>(Louis)</center> | <center>(Tigo)</center> |


































