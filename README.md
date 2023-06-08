# Volvo RTVI System
Road Traffic and Vehicle Information

![TITLE IMAGE](repo/title2.jpg?raw=true "Title")

Infotainment system based on a Raspberry Pi for the Volvo P1 platform. Combines Apple Carplay/Android Auto with a dashboard for CAN data. This project is based on the following Git-Repositories and internet articles:

- evy0311         - Volvo-CAN-Gauge
- rhysmorgan134   - react-carplay
- laurynas        - volvo-crankshaft
- LuukEsselbrugge - Volve

* [In-Car Raspberry PSU Controller](https://dontpressthat.wordpress.com/2017/10/13/in-car-raspberry-pi-psu-controller/)

All of the above sources have been altered to my needs and are bundled with a custom app in this repository.

The app is intended to work with Volvo P1 T5 models but basically you can alter it for any make and model. Just keep in mind that the Dashboard won't work unless you make the necessary changes in the python script as well as Dashboard.js.

> You can find a demo gif at the end of the readme.

### > Note:

Due to some differencies in the communication, Android Auto is not working properly as of now. Hopefully that can be fixed in the future.

## Content

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li><a>| Hardware</a></li>
    <li><a>| Display Mod</a></li>
    <li><a>| Raspberry PSU</a></li>
    <li><a>| CAN Implementation</a></li>
    <li><a>| RTVI App</a></li>
    <li><a>| Wiring</a></li>
    <li><a>| Set Up</a></li>
    <li><a>| Audio</a></li>
    <li><a>| Extended Functionality</a></li>
    <li><a>| Final Words</a></li>
  </ol>
</details>

## 01 | Hardware

To get this build running you will need the following hardware. Tools and materials like wires or zip ties are not included. The display components are optional but the one I am proposing has a much better resolution than the original one. If you want to use the original display, you can find a way to do so in the repositories from laurynas.

* [MCP2515 CAN Module](https://www.amazon.de/-/en/Intelligent-Electronics-Receiver-Controller-Development/dp/B07MY2D7TW/ref=sr_1_6?keywords=mcp2515&qid=1662026860&sr=8-6)
* MCP2004 LIN Transceiver
* [LCD Driver](https://de.aliexpress.com/item/4001175095149.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [LCD Display](https://de.aliexpress.com/item/32835602509.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [6.5" Touch Screen Module](https://www.ebay.de/itm/170981315406)
* [12V to 5V Buck Converter, 5A](https://www.amazon.de/gp/product/B071ZRXKJY/ref=ppx_yo_dt_b_asin_title_o06_s00?ie=UTF8&psc=1)

* [Carlinkit Adapter](https://www.amazon.de/CarlinKit-Wireless-CarPlay-Aftermarket-Mirroring-Black/dp/B09ZPBL4HP/ref=sr_1_18_sspa?keywords=Carlinkit&qid=1662026978&sr=8-18-spons&psc=1&smid=AWLAK6Y9FEYBP&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFLQVVHRlBSTkdIT0cmZW5jcnlwdGVkSWQ9QTA2NzUwNDAzTjhaUjJJQkQ1N0xXJmVuY3J5cHRlZEFkSWQ9QTAwNDAzNTMyNVdPTUdaM1VTQU8wJndpZGdldE5hbWU9c3BfbXRmJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==)
* [12V 5A Fuse](https://www.amazon.de/Neuftech%C2%AE-Sicherungshalter-Flachsicherung-Sicherung-wasserdicht/dp/B00UX6NIQE/ref=asc_df_B00UX6NIQE/?tag=googshopde-21&linkCode=df0&hvadid=310359968785&hvpos=&hvnetw=g&hvrand=13883660999016731185&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9043309&hvtargid=pla-561148277227&psc=1&th=1&psc=1&tag=&ref=&adgrpid=62443302395&hvpone=&hvptwo=&hvadid=310359968785&hvpos=&hvnetw=g&hvrand=13883660999016731185&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9043309&hvtargid=pla-561148277227)

- Raspberry PSU
- OEM P1 RTI Display Unit
- Raspberry Pi

### > Note:

The app runs on a RPi3 as well as on a RPi4 with OS Buster. Eventually, Carplay will run a little bit worse on a RPi 3 but this wasn't tested throughly yet.

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

In short, here are the reasons why:
- Capacitance of the buck converter itself
- Floating states on Q2/Q3

More info’s on the issues and the solution can be found here: [link](https://forum.core-electronics.com.au/t/pi-power-switch-using-car-ignition-logic/6177/7). You can also find an updated and working schematic in the schematics folder of this repository. Basically, you only need to add two resistors. As stated in the original article, it is advisable to put a heatsink on the big transistor.


## 04 | CAN Implementation

CAN communication with the Raspberry Pi is pretty straightforward. The only thing you will need for this is a MCP2515 module and adjust some settings. To connect your Raspi with the module you can follow this [link](https://forums.raspberrypi.com/viewtopic.php?t=296117).

### > Note:

Make sure that you also set up the automatic CAN channel activation on boot!

## 05 | RTVI App

This app uses a combination of node.js, Electron and React to set up a custom interface in the fashion of Rhys Morgan's "react-carplay". Kudos to him for figuring all of this out and for helping me to troubleshoot some things along the way.

![CARPLAY IMAGE](repo/carplay.jpg?raw=true "Carplay")

The app is in a usable state and I encourage anyone to help me improve it. In order to use Carplay/Android Auto you will need to have a Carlinkit adapter. In this repository you can find the full source code and altering it to your needs is quite straightforward.

### > Note:

You need a working internet connection when you launch the app for the first time because it needs to download some resources for the dongle.


## 06 | Wiring

In the installation schematic you can see how you connect everything with each other. I advise to keep the cables a bit longer and then shorten everything to the appropriate length once you install the package in your car.

![PACKAGE2 IMAGE](repo/package2.jpg?raw=true "Package2")
![PACKAGE IMAGE](repo/package.jpg?raw=true "Package")

I decided to wire the connections to the car directly to the pins of the CEM connectors. This way I am not destroying any harnesses, it's easy cause the pins are known and you can rebuild everything back to factory if you decide to undo the mod for whatever reason. Soldering in the passengers’ foot compartment is not the most comfortable thing but it is manageable and as a result you have a clean integration of your electronics with a little additional wire harness to run your setup. One thing to keep in mind though is to choose wires that are not too thick so you can put the pin back into the connector. This is especially an issue with the CAN wiring.

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

Make sure that you stress-relief all your wiring connections with zip ties, so the cable does not wiggle around and makes more damage in case a connection brakes.

![WIRING IMAGE](repo/wiring.jpg?raw=true "Wiring")

## 07 | Set Up

### > Running the app:

Download 'RTVI-Installer.sh' from the latest Release and execute it:

```
sh RTVI-Installer.sh
```
The setup will download and install everything as needed. To run the application, navigate to the AppImage and execute it:

```
./RTVI.AppImage --no-sandbox
```

### > Building the app:

1.) Install Prerequisites

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install ffmpeg
sudo apt-get install libudev-dev
sudo apt-get install python-can
```


2.) Install Node.js:

```
sudo apt-get install npm
sudo npm install -g n
sudo n 18.12.1
sudo npm install -g npm@8.19.2
```

3.) Clone the repository and build it:

```
git clone https://github.com/LRYMND/volvo-rtvi/
cd volvo-rtvi
npm install --force
npm run build-package
```


### > RasPi setup & clean boot:


1.) Add these lines to your "/boot/config.txt"

```
#Shutdown and remove power from PSU
dtoverlay=gpio-shutdown,active_low=0,gpio_pull=up
dtoverlay=gpio-poweroff

#Disable rainbow image at boot
disable_splash=1
```

2.) Open "/boot/cmdline.txt" and add this at the end of the line

```
logo.nologo vt.global_cursor_default=0
```

3.) To automatically hide the mouse curser you will need to install unclutter and add another line to your "/boot/config.txt"

```
sudo apt-get install unclutter
```

This command will hide the cursor automatically after 2 seconds:

```
@unclutter -idle 2
```

4.) To automatically hide the taskbar simply right-click it to activate this setting.

## 08 | Audio

There are a couple of ways to use the raspberry as an audio source for your car speakers now. I propose a [small module](https://www.tindie.com/products/justtech/aux-input-volvo-v50-s40-c30-c70-xc90/) from Lithuania with which you can mod your radio to add an aux port. There is also a Bluetooth version available but since the phone is already wirelessly connected to the Carlinkit adapter dongle, an aux-cable seems pretty clean and less prone to failure.

If you already have an aux port in your car, you don't need this input board. Simply connect the raspberry pi directly to the aux port.

### > Note:

This is no advertisement, just a clean and simple solution IMO.

## 09 | Extended Functionality:

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

## 10 | Final Words

![DEMOGIF](repo/demo.gif?raw=true "Demo")

I’m using the setup since several months now. I drove on the highway, over bumpy gravel roads, at 35°C in the sun and -10°C in the winter and so far, it did not let me down. It can happen that the Carplay interface freezes occasionally. In that case you can simply reconnect the phone or restart/reboot from the settings page. However, this rarely happens.

### > ToDo

The app is in a very usable state and already has some useful functionality. With the setup described above, the raspberry also has full access to the CAN- as well as the LIN-Bus of the car.

A next step could be to start mapping the CAN signals of different buttons in the car and associate them with functions in the app, like turning on cruise-control on ignition or building an AC interface.

I'd be happy if anybody who has tips for improvement can chime in. Check out the [Swedespeed Thread](https://www.swedespeed.com/threads/volvo-rtvi-raspberry-media-can-interface.658254/) and share your ideas, findings or issues.

### > Disclaimer

I am not a software developer, electrical engineer or automotive technician and doing stuff like this is just a hobby for me. I am distancing myself from any damage that you might do to your car in case you want to follow this guide. The setup I described above is the way I fitted things to my V50. Eventually you will need to find other places to mount your components and different paths to route your cables, after all it's a DIY mod.
