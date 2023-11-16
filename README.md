# Volvo RTVI System
Road Traffic and Vehicle Infotainment

![TITLE IMAGE](repo/title2.jpg?raw=true "Title")  

![PAGES IMAGE](repo/pages.jpg?raw=true "Pages")  

This is a react web-app to run natively on Mac/Linux and therefore also on a RaspberryPi. It's providing a fully functioning Carplay/AndroidAuto integration as well as an interface for canbus and linbus. The app is intended for Volvo P-chassis with a T5 engine (C30, V50, V70 II). However, the canbus codes can be easily adjusted with an exposed settings file in order to change the data.

This project is based on the following repositories:

- evy0311         - Volvo-CAN-Gauge
- rhysmorgan134   - react-carplay
- laurynas        - volvo-crankshaft
- LuukEsselbrugge - Volve

* [volvo-can-gauge](https://github.com/evy0311/Volvo-CAN-Gauge)
* [react-carplay](https://github.com/rhysmorgan134/react-carplay)
* [volvo-crankshaft](https://github.com/laurynas/volvo_crankshaft)
* [volve](https://github.com/LuukEsselbrugge/Volve)
* [volvo-vida](https://github.com/Tigo2000/Volvo-VIDA)

> You can find a demo gif at the end of the readme.

Got any tips for improvement or need help?  
Join our discussion on [Swedespeed](https://www.swedespeed.com/threads/volvo-rtvi-raspberry-media-can-interface.658254/)!

### > How to use:
```
git clone https://github.com/lrymnd/volvo-rtvi.git
cd volvo-rtvi
npm i
npm build
npm run app / dev / kiosk
```

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

## 01 | BOM

Down below is a list of the required hardware. The display is optional but the one I am proposing has a much better resolution and supports touch input. If you want to use the original display, you can find a way to do so in the repositories from laurynas.

* [MCP2515 CAN Module](https://www.amazon.de/-/en/Intelligent-Electronics-Receiver-Controller-Development/dp/B07MY2D7TW/ref=sr_1_6?keywords=mcp2515&qid=1662026860&sr=8-6)
* MCP2004 LIN Transceiver
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

This guide involves adding an aftermarket touchscreen to the 6.5" LCD to enhance the usability. This is optional but I highly recommend it. Do not expect the same responsiveness as your smartphone though.

To swap the display, you will have to disassemble your original RTI unit and take all the display components out. Afterwards you will need to mount the touchscreen to your LCD panel and glue the new display/touchscreen unit into the RTI frame. The buck converter as well as the display and touch screen drivers are mounted to the backside of the LCD panel because space is quite limited. More information can also be found in laurynas' repo.

![SCREENMOD IMAGE](repo/screenmod.jpg?raw=true "Screen Mod")


## 03 | Raspberry PSU

The power supply should fulfill some critical demands and available solutions are quite bulky.

- Raspi boots when igniton is turned ON
- Raspi gracefully shuts off when ignition is turned off
- Little to no power is consumed in the off state so the battery is not drained

I went through hours of online research until I found an article that would end my quest. However, after ordering the PCB and soldering the components I found out that the circuit was not functioning as expected. Once the ignition was off the Raspberry would immediately turn back on again.

[Source](https://dontpressthat.wordpress.com/2017/10/13/in-car-raspberry-pi-psu-controller/)

In short, here are the reasons why:
- Capacitance of the buck converter itself
- Floating states on Q2/Q3

More info on the issues and the solution can be found [here](https://forum.core-electronics.com.au/t/pi-power-switch-using-car-ignition-logic/6177/7). You can also find an updated and working schematic in the schematics folder of this repository. Basically, you only need to add two resistors. As stated in the original article, it is advisable to put a heatsink on the big transistor.

A KiCAD project file and the PSU Gerber files are also available in the schematics folder. 

## 04 | CAN Implementation

CAN communication with the Raspberry Pi is pretty straightforward. The only thing you will need for this is a MCP2515 module and adjust some settings. To connect your Raspi with the module you can follow [this](https://forums.raspberrypi.com/viewtopic.php?t=296117).

### > Note:

Make sure that you also set up the automatic CAN channel activation on boot!


## 05 | Wiring

In the installation schematic you can see how you connect everything. I advise to keep the cables a bit longer and then shorten everything to the appropriate length once you install the package in your car.

![PACKAGE2 IMAGE](repo/package2.jpg?raw=true "Package2")
![PACKAGE IMAGE](repo/package.jpg?raw=true "Package")

I decided to wire the connections to the car directly to the pins of the CEM connectors. This way I am not destroying any harnesses, you can easily look up the pins in the documentation and you can rebuild everything back to factory if you decide to undo the mod for whatever reason. The idea is to have a small additional wire harness to run your entire setup. Keep in mind to choose wires that are not too thick so you can put the pin back into the connector. This is especially an issue with the CAN wiring.

You need to make the following connections.

| Connection  | Connector | Pin |
| ----------- | --------- | --- |
| CAN-H       | B         | 11  |
| CAN-L       | B         | 12  |
| GND         | A         | 28  |
| IGN         | A         | 17  |
| 12V         | E         | 21  |

![EWD SCHEMATIC](repo/ewdschematic.jpeg?raw=true "EWD Schematic")
(Borrowed from the original Volvo Electronic Wiring Diagrams)

### > Note:

Make sure that you stress-relief all wiring connections and secure them properly with zip ties.


![WIRING IMAGE](repo/wiring.jpg?raw=true "Wiring")

## 06 | Set Up

### > Installing the app:

```
Launch the script "RTVI-web-app-installer.sh" in order to install the app.
```

### > Running the app:

```
Launch the script "run.sh" in order to run the app.
```

## 07 | Audio

There are a couple of ways to use the raspberry as an audio source for your car speakers now. I propose a [small module](https://www.tindie.com/products/justtech/aux-input-volvo-v50-s40-c30-c70-xc90/) from Lithuania with which you can mod your radio to add an aux port. There is also a Bluetooth version available but since the phone is already wirelessly connected to the Carlinkit adapter dongle, an aux-cable seems pretty clean and less prone to failure.

If you already have an aux port in your car, you don't need this input board. Simply connect the raspberry pi directly to the aux port.

### > Note:

This is no advertisement, just a clean and simple solution IMO.

## 08 | Extended Functionality:

### > Steering Wheel Controls

It is possible to connect an Arduino to the LIN Bus so the steering wheel button inputs can be converted to keyboard/mouse HID events. The setup described below implements this as well as controls opening/closing of the RTI screen by sending serial events to the RTI screen module.

Suitable Arduinos are Leonardo or Pro Micro. I recommend option for a Pro Micro because of the limited space. However it can be quiet tricky to get it running so a Leonardo is a suitable fallback solution.

The easiest place to find the LIN Bus is the ICM Connector A behind the waterfall. Either connect a DuPont wire to the associated pin or disassemble the ICM and solder a small wire to it.

![ICM_CONNECTOR_IMAGE](repo/icm_connector.png?raw=true "LIN Connector")

![ICM_CONNECTION_IMAGE](repo/icm_connection.jpg?raw=true "LIN Connection")

The LIN Bus wire must be connected to pin 6 of the LIN bus transceiver labeled "Lbus".

![MCP2004_PINOUT_IMAGE](repo/MCP2004_pinout.png?raw=true "LIN Transceiver pinout")

Connect RX, TX and CS from the MCP2004 to LIN_RX_PIN, LIN_TX_PIN and CS_PIN respectively. After testing, it turned out that it was not necessary to connect the Fault pin to the Arduino. In Laurynas' volvo_linbus repo, this fault pin is connected in the scheme but there is a typo in the code, so it's not used.

### > RTI folding mechanism

Connect RTI_TX_PIN (see Arduino code) to pin 4 of the RTI unit. Since we are only sending serial data, RTI_RX_PIN does not have to be connected. Again, either use a DuPont wire or solder directly to the RTI PCB/connector. Don't forget to also connect pin 7 (GND) to the Arduino, Raspi or another common grounding point.

![RTI_CONNECTOR_IMAGE](repo/rti_connector.png?raw=true "RTI Connector")

When ignition is turned on, the RTI screen automatically pops up and you can use the joystick on the back of the steering wheel to navigate through CarPlay. When clicking on the 'enter' rti button on the back of the steering wheel, the Arduino sends an ASCII 'space' event (spacebar) to navigate the app, since CarPlay requires this instead of a left click or a return/enter.

### > Using the SW Module

- Holding down 'prev' button for 2 seconds toggles between normal and mouse mode.
- When in mouse-mode, the 'enter' button acts as a left mouse click instead of a spacebar.
- Long-pressing the 'back' button will close the RTI screen.
- Clicking on 'enter' will open the screen again.

(The button mappings, timeouts etc can all be changed in the Arduino code.)

### > Adding Peripherals

![USB IMAGE](repo/usb.jpg?raw=true "USB")

To make life a bit easier I connected an USB extension cable to the Raspi which ends up in the tray behind the waterfall console so I can directly connect peripherals to it. This also works as a charging port for a phone. It's not fast but it works.

## 09 | Roadmap

- [ ] Integrate DTC functionality
- [ ] Sniff canbus messages
- [ ] Integrate MOST-bus
- [ ] Improve hardware and installation

## 10 | Disclaimer

I am distancing myself from any damage that you might do to your car in case you want to follow this guide. The setup I described above is the way I fitted the package to my V50 and I know of several people who completed the mod successfully. Eventually you will need to find other places to mount your components and different paths to route your cables, after all it's DIY!

![DEMOGIF](repo/demo.gif?raw=true "Demo")

Got any tips for improvement or need help?  
Join our discussion on [Swedespeed](https://www.swedespeed.com/threads/volvo-rtvi-raspberry-media-can-interface.658254/)!


Want to support us?  
| [![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/default-orange.png)](https://www.buymeacoffee.com/lrymnd)  | [![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/default-orange.png)](https://www.buymeacoffee.com/tigo) |
|---|---|
| <center>(Louis)</center> | <center>(Tigo)</center> |