# Volvo RTVI System
Road Traffic and Vehicle Infotainment

![TITLE IMAGE](repo/media/title2.jpg?raw=true "Title")  

This is a react web-app to run natively on Mac/Linux and therefore also on a RaspberryPi. It's providing a fully functioning Carplay/AndroidAuto integration as well as an interface for canbus and linbus. The app is intended for Volvo P-chassis with a T5 engine (C30, V50, V70 II). However, the canbus codes can be easily adjusted with an exposed settings file in order to change the data.

![PAGES IMAGE](repo/media/pages.jpg?raw=true "Pages")  

> You can find a demo gif at the end of the readme.

---

The project is based on the following repositories:

* [volvo-can-gauge](https://github.com/evy0311/Volvo-CAN-Gauge)
* [react-carplay](https://github.com/rhysmorgan134/react-carplay)
* [volvo-crankshaft](https://github.com/laurynas/volvo_crankshaft)
* [volve](https://github.com/LuukEsselbrugge/Volve)
* [volvo-vida](https://github.com/Tigo2000/Volvo-VIDA)

Got any tips for improvement or need help?  
Join our discussion on [Swedespeed](https://www.swedespeed.com/threads/volvo-rtvi-raspberry-media-can-interface.658254/)!

### > How to use:
```
Production:
1.) wget "https://github.com/LRYMND/volvo-rtvi/releases/download/v2.0.0/Installer.sh"
2.) chmod +x Installer.sh
3.) sh Installer.sh

@volvo-rtvi/: python Volvo-RTVI-2.0.0.py
```
```
Development:
1.) git clone https://github.com/lrymnd/volvo-rtvi.git
2.) cd volvo-rtvi
3.) pip install -r requirements.txt
4.) cd frontend
5.) npm i & npm run build

@volvo-rtvi/frontend/: npm run vite
@volvo-rtvi/: python Volvo-RTVI-2.0.0.py dev
```

---

## Content

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li><a>| BOM</a></li>
    <li><a>| Display Mod</a></li>
    <li><a>| Raspberry PSU</a></li>
    <li><a>| CAN Implementation</a></li>
    <li><a>| Wiring</a></li>
    <li><a>| Set Up</a></li>
    <li><a>| Audio</a></li>
    <li><a>| Extended Functionality</a></li>
    <li><a>| Roadmap</a></li>
    <li><a>| Disclaimer</a></li>
  </ol>
</details>

---

## 01 | BOM

Down below is a list of the required hardware. The display is optional but the one proposed has a much better resolution and also supports touch input with an additional panel. If you want to use the original display, you can find a way to do so in the repositories from laurynas, however, its highly recommended to go the extra mile.

* MCP2004 LIN Transceiver
* [MCP2515 CAN Module](https://www.amazon.de/-/en/Intelligent-Electronics-Receiver-Controller-Development/dp/B07MY2D7TW/ref=sr_1_6?keywords=mcp2515&qid=1662026860&sr=8-6)
* [LCD Driver](https://de.aliexpress.com/item/4001175095149.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [LCD Display](https://de.aliexpress.com/item/32835602509.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [6.5" Touch Screen Module](https://www.ebay.de/itm/170981315406)
* [12V to 5V Buck Converter, 5A](https://www.amazon.de/gp/product/B071ZRXKJY/ref=ppx_yo_dt_b_asin_title_o06_s00?ie=UTF8&psc=1)
* [12V 5A Fuse](https://www.amazon.de/Neuftech%C2%AE-Sicherungshalter-Flachsicherung-Sicherung-wasserdicht/dp/B00UX6NIQE/ref=asc_df_B00UX6NIQE/?tag=googshopde-21&linkCode=df0&hvadid=310359968785&hvpos=&hvnetw=g&hvrand=13883660999016731185&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9043309&hvtargid=pla-561148277227&psc=1&th=1&psc=1&tag=&ref=&adgrpid=62443302395&hvpone=&hvptwo=&hvadid=310359968785&hvpos=&hvnetw=g&hvrand=13883660999016731185&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9043309&hvtargid=pla-561148277227)

* [Carlinkit Adapter](https://www.amazon.de/CarlinKit-Wireless-CarPlay-Aftermarket-Mirroring-Black/dp/B09ZPBL4HP/ref=sr_1_18_sspa?keywords=Carlinkit&qid=1662026978&sr=8-18-spons&psc=1&smid=AWLAK6Y9FEYBP&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFLQVVHRlBSTkdIT0cmZW5jcnlwdGVkSWQ9QTA2NzUwNDAzTjhaUjJJQkQ1N0xXJmVuY3J5cHRlZEFkSWQ9QTAwNDAzNTMyNVdPTUdaM1VTQU8wJndpZGdldE5hbWU9c3BfbXRmJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==)

Also:

- Raspberry PSU
- OEM P1 RTI Display Unit
- Raspberry Pi

### > Note:

The app runs on a RPi3 as well as on a RPi4 with OS Buster and Bullseye, both on 32 and 64-bit.

## 02 | Display Mod

This guide involves adding an aftermarket touchscreen to the 6.5" LCD to enhance the usability. This is optional but it's highly recommended! To swap the display, you will have to disassemble your original RTI unit and take the original display components out. Afterwards you will need to mount the touchscreen to your LCD panel and mount the new display/touchscreen unit into the RTI frame. The buck converter as well as the display and touch screen drivers are mounted to the backside of the LCD panel because space is quite limited.


![SCREENMOD IMAGE](repo/media/screenmod.jpg?raw=true "Screen Mod")

---

## 03 | Raspberry PSU

The power supply should fulfill some critical demands and available solutions are quite bulky.

- Raspi boots when igniton is turned ON
- Raspi gracefully shuts off when ignition is turned off
- Little to no power is consumed in the off state so the battery is not drained

In the schematics folder you will find a fully working PSU that fulfills all of these criteria. It will also host the MCP2004 chip in order to connect your Raspberry to the LIN-bus. Along with it comes a KiCAD project file as well as the PSU Gerber files so you can build or order your own PSU from one of the many PCB manufacturers. It is advisable to put a heatsink on the big transistor.

The original source can be found [here](https://dontpressthat.wordpress.com/2017/10/13/in-car-raspberry-pi-psu-controller/). Also you can check out [this](https://forum.core-electronics.com.au/t/pi-power-switch-using-car-ignition-logic/6177/7) article for some more information.


## 04 | CAN Implementation

CAN communication with the Raspberry Pi is pretty straightforward. The only thing you will need for this is a MCP2515 module and adjust some settings. To connect your Raspi with the module you can follow [this](https://forums.raspberrypi.com/viewtopic.php?t=296117).

### > Note:

Make sure that you also set up the automatic CAN channel activation on boot!

---

## 05 | Wiring

In the installation schematic you can see how you connect everything. Keep the cables longer in the beginning and then shorten everything to the appropriate length once you install the package in your car.

![PACKAGE2 IMAGE](repo/media/package2.jpg?raw=true "Package2")
![PACKAGE IMAGE](repo/media/package.jpg?raw=true "Package")

The easiest way is to mount the wires to the pins of the CEM connectors. This way you are not destroying or splicing any harnesses, the pins can be found easily in the documentation and you can rebuild everything back to factory if you decide to undo the mod for whatever reason. The idea is to have a small additional wire harness to run your entire setup. Keep in mind to choose wires that are not too thick so you can put the pin back into the connector. This is especially an issue with the CAN wiring.

You need to make the following connections.

| Connection  | Connector | Pin |
| ----------- | --------- | --- |
| CAN-H       | B         | 11  |
| CAN-L       | B         | 12  |
| GND         | A         | 28  |
| IGN         | A         | 17  |
| 12V         | E         | 21  |

![EWD SCHEMATIC](repo/media/ewdschematic.jpeg?raw=true "EWD Schematic")
(Borrowed from the original Volvo Electronic Wiring Diagrams)

### > Note:

Make sure that you stress-relief all wiring connections and secure them properly with zip ties.

---

![WIRING IMAGE](repo/media/wiring.jpg?raw=true "Wiring")

## 06 | Set Up

### > Installing the app:

```
Launch the script "Installer.sh" in order to install the app.
```

### > Running the app:

```
python Volvo-RTVI-2.0.0.py
```

---

## 07 | Audio

There are a couple of ways to use the raspberry as an audio source for your car speakers now. I propose a [small module](https://www.tindie.com/products/justtech/aux-input-volvo-v50-s40-c30-c70-xc90/) from Lithuania with which you can mod your radio to add an aux port. There is also a Bluetooth version available but since the phone is already wirelessly connected to the Carlinkit adapter dongle, an aux-cable seems pretty clean and less prone to failure.

### > Note:

This is no advertisement, just a clean and simple solution IMO.

---

## 08 | Extended Functionality:

### > Steering Wheel Controls

In order to implement the steering wheel controls, you need to connect the Raspberry to the LIN bus of your car. The app will convert the signals from the sw buttons to keyboard/mouse HID events. Also you will be able to control opening/closing of the RTI screen by sending serial events to the RTI screen module.

The LIN Bus wire must be connected to pin 6 of the LIN bus transceiver labeled "Lbus".

![MCP2004_PINOUT_IMAGE](repo/media/MCP2004_pinout.png?raw=true "LIN Transceiver pinout")


The easiest place to find the LIN Bus is the "ICM Connector A" behind the waterfall. Either connect a DuPont wire to the associated pin or disassemble the ICM and solder a small wire to it.

| LIN Connector | LIN Connection |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ![ICM_CONNECTOR_IMAGE](repo/media/icm_connector.png?raw=true "LIN Connector") | ![ICM_CONNECTION_IMAGE](repo/media/icm_connection.jpg?raw=true "LIN Connection") |


Connect RX, TX and CS from the MCP2004 to LIN_RX_PIN, LIN_TX_PIN and CS_PIN respectively. After testing, it turned out that it was not necessary to connect the Fault pin to the Arduino. In Laurynas' volvo_linbus repo, this fault pin is connected in the scheme but there is a typo in the code, so it's not used.

### > RTI folding mechanism

Connect RTI_TX_PIN to pin 4 of the RTI unit. Again, either use a DuPont wire or solder directly to the RTI PCB/connector. Don't forget to also connect pin 7 (GND) to the Raspi or another common grounding point.

![RTI_CONNECTOR_IMAGE](repo/media/rti_connector.png?raw=true "RTI Connector")

When ignition is turned on, the RTI screen automatically folds up and you can use the joystick on the back of the steering wheel to navigate through CarPlay. When clicking on the 'Enter' button on the back of the steering wheel, the Arduino sends an ASCII 'space' event (spacebar) to navigate the app. (CarPlay requires this instead of a left click or a return/enter)

### > Using the SW Module

Control folding mechanism:

| Button  | Function                  |
| ------- | ------------------------- |
| 'back'  | Hold down to close screen |
| 'enter' | Click to open screen      |

Control interface:

| Button     | Normal Mode | Mouse Mode         |
| ---------- | ----------- | ------------------ |
| 'Enter'    | Enter       | Left Click         |
| 'Joystick' | Navigate    | Control mouse      |

Holding down 'prev' button for 2 seconds toggles between normal and mouse mode. The button mappings, timeouts etc can be adjusted in the settings file.

### > Adding Peripherals

![USB IMAGE](repo/media/usb.jpg?raw=true "USB")

To make life a bit easier, you can connect an USB extension cable to the Raspi and mount it to the removable tray behind the waterfall console. This way you can directly connect peripherals to it.

---

## 09 | Roadmap

- [ ] 3D-printed display mount
- [ ] Integrate DTC functionality
- [ ] Sniff canbus messages
- [ ] Integrate MOST-bus
- [ ] Improve hardware and installation

---

## 10 | Disclaimer

I am distancing myself from any damage that you might do to your car in case you want to follow this guide. The setup described above is the way we fitted the package to our cars. Eventually you will need to find other places to mount your components and different paths to route your cables, it's DIY after all!

![DEMOGIF](repo/media/demo.gif?raw=true "Demo")
(Outdated - Version 1.2.1)

Got any tips for improvement or need help?  
Join our discussion on [Swedespeed](https://www.swedespeed.com/threads/volvo-rtvi-raspberry-media-can-interface.658254/)!

---

Want to support us?  
| [![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/default-orange.png)](https://www.buymeacoffee.com/lrymnd)  | [![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/default-orange.png)](https://www.buymeacoffee.com/tigo) |
|---|---|
| <center>(Louis)</center> | <center>(Tigo)</center> |