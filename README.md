# Volvo RTVI System
Road Traffic and Vehicle Information

![TITLE IMAGE](repo/title.jpg?raw=true "Title")

Infotainment system based on a Raspberry Pi for the Volvo P1 platform. Combines Apple Carplay/Android Auto with a dashboard for CAN data. This project is based on the following Git-Repositories and internet articles:

- evy0311         - Volvo-CAN-Gauge
- rhysmorgan134   - react-carplay
- laurynas        - volvo-crankshaft
- LuukEsselbrugge - Volve

* [In-Car Raspberry PSU Controller](https://dontpressthat.wordpress.com/2017/10/13/in-car-raspberry-pi-psu-controller/)

All of the above sources have been altered to my needs and are bundled with a custom app in this repository.

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
    <li><a>| Additional Information</a></li>
    <li><a>| Final Words</a></li>
  </ol>
</details>

## 1 | Hardware

In order to get this build running you will need the following hardware. Tools and materials like wires or zipties are not included. The display components are optional but the one I'm proposing has a much better resolution than the original one. If you want to use the original display you can find a way to do so in the repositories from laurynas.

* [MCP2515 CAN Module](https://www.amazon.de/-/en/Intelligent-Electronics-Receiver-Controller-Development/dp/B07MY2D7TW/ref=sr_1_6?keywords=mcp2515&qid=1662026860&sr=8-6)
* [LCD Driver](https://de.aliexpress.com/item/4001175095149.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [LCD Display](https://de.aliexpress.com/item/32835602509.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [6.5" Touch Screen Module](https://www.ebay.de/itm/170981315406)
* [12V to 5V Buck Converter, 5A](https://www.amazon.de/gp/product/B071ZRXKJY/ref=ppx_yo_dt_b_asin_title_o06_s00?ie=UTF8&psc=1)

* [Carlinkit Adapter](https://www.amazon.de/CarlinKit-Wireless-CarPlay-Aftermarket-Mirroring-Black/dp/B09ZPBL4HP/ref=sr_1_18_sspa?keywords=Carlinkit&qid=1662026978&sr=8-18-spons&psc=1&smid=AWLAK6Y9FEYBP&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFLQVVHRlBSTkdIT0cmZW5jcnlwdGVkSWQ9QTA2NzUwNDAzTjhaUjJJQkQ1N0xXJmVuY3J5cHRlZEFkSWQ9QTAwNDAzNTMyNVdPTUdaM1VTQU8wJndpZGdldE5hbWU9c3BfbXRmJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==)
* [12V 5A Fuse](https://www.amazon.de/Neuftech%C2%AE-Sicherungshalter-Flachsicherung-Sicherung-wasserdicht/dp/B00UX6NIQE/ref=asc_df_B00UX6NIQE/?tag=googshopde-21&linkCode=df0&hvadid=310359968785&hvpos=&hvnetw=g&hvrand=13883660999016731185&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9043309&hvtargid=pla-561148277227&psc=1&th=1&psc=1&tag=&ref=&adgrpid=62443302395&hvpone=&hvptwo=&hvadid=310359968785&hvpos=&hvnetw=g&hvrand=13883660999016731185&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9043309&hvtargid=pla-561148277227)
- Raspberry PSU
- OEM P1 RTI Display Unit
- Raspberry Pi

I advise to go with a Raspberry Pi 4. It also works on the Raspberry Pi 3 but the performance will be much worse.

## 2 | Display Mod

This guide involves adding an aftermarket touchscreen to the 6.5" LCD to enhance the usability. This is optional but I highly recommend it. Don't expect the same responsiveness as your smartphone though.

To swap the display, you will have to disassemble your original RTI unit and take all the display components out. Afterwards you will need to mount the touchscreen to your LCD panel and glue the new display/touchscreen unit into the RTI frame. The buck converter as well as the display and touch screen drivers are mounted to the backside of the LCD panel because space is quiet limited. More information can also be found in laurynas' repo.

![SCREENMOD IMAGE](repo/screenmod.jpg?raw=true "Screen Mod")


## 3 | Raspberry PSU

The power supply should fulfill some critical demands and available solutions are quiet bulky.

- Raspi boots when igniton is turned ON
- Raspi gracefully shuts off when ignition is turned off
- Little to no power is consumed in the off state so the battery isn't drained

I went through hours of online research until I found an [article](https://dontpressthat.wordpress.com/2017/10/13/in-car-raspberry-pi-psu-controller/) that would end my quest. However, after ordering the PCB and soldering the components I had to find out that the circuit was not functioning as expected. Once the ignition was off the Raspberry would immediatley turn back on again.

In short, here are the reasons why:
- Capacitance of the buck converter itself
- Floating states on Q2/Q3

More infos on the issues and the solution can be found here: [link](https://forum.core-electronics.com.au/t/pi-power-switch-using-car-ignition-logic/6177/7). You can also find an updated and working schematic in the schematics folder of this repository. Basically you only need to add two resistors. As stated in the original article, it is adviseable to put a heatsink on the big transistor.


## 4 | CAN Implementation

CAN Communication with the Raspberry Pi is pretty straight forward. The only thing you will need for this is a MCP2515 module and adjust some settings. In order to connect your Raspi with the module you can follow this [link](https://forums.raspberrypi.com/viewtopic.php?t=296117).

Make sure that you also set up the automatic can channel activation on boot!


## 5 | RTVI App

This app uses a combination of node.js, Electron and React to set up a custom interface in the fashion of Rhys Morgan's "react-carplay". Kudos to him for figuring all of this out and for helping me to troubleshoot some things along the way.

![CARPLAY IMAGE](repo/carplay.jpg?raw=true "Carplay")

The app is in a usable state and I engourage anyone to help me improve it. In order to use Carplay/Android Auto you will need to have a Carlinkit adpater. In this repository you can find the full source code and altering it to your needs is quiet straight forward. For example to change the displayed CAN data, you will only have to make a few changes to python.py and Dashboard.js.

### Note:

You need a working internet connection when you launch the app for the first time because it needs to download some resources for the dongle.


## 6 | Wiring

In the installation schematic you can see how you connect everything with each other. I advise to keep the cables a bit longer and then shorten everything to the appropriate lenght once you install the package in your car.

![PACKAGE2 IMAGE](repo/package2.jpg?raw=true "Package2")
![PACKAGE IMAGE](repo/package.jpg?raw=true "Package")


I decided to wire the connections to the car directly to the pins of the CEM connectors. This way I'm not destroying any harnesses, it's easy cause the pins are known and you can rebuild everything back to factory if you decide to undo the mod for whatever reason. Soldering in the passengers foot compartment is not the most comfortable thing but it's managable and as a result you have a very clean integration of your electronics with a little additional wire harness to run your setup. One thing to keep in mind though is to choose wires that are not too thick so you can put the pin back into the connector. This is especially an issue with the CAN wiring.

You need to make the following connections.

| Connection  | Connector | Pin |
| ----------- | --------- | --- |
| CAN-H       | B         | 11  |
| CAN-L       | B         | 12  |
| GND         | A         | 28  |
| IGN         | A         | 17  |
| 12V         | E         | 21  |

![EWD SCHEMATIC](repo/ewdschematic.jpeg?raw=true "EWD Schematic")
(Borrowed from the original Volvo Wiring Diagrams)

NOTE: Make sure that you stress-relief all your wiring connections with zipties, so the cable doesnt wiggle around and makes more damage in case a connection brakes.

![WIRING IMAGE](repo/wiring.jpg?raw=true "Wiring")

## 7 | Set Up

### Running the app:


1.) Install prerequisites:

```
sudo apt-get install libudev-dev
sudo apt-get install python-can
```

2.) Download the latest release, navigate to the folder and execute these commands:

```
sh setup-permissions.sh
chmod +x App.AppImage
./App.AppImage --no-sandbox
```


### Building the app:


1.) Install prerequisites:

```
sudo apt-get install libudev-dev
sudo apt-get install python-can
sudo apt-get install npm
sudo npm install -g n
sudo n 18.12.1
sudo npm install -g npm@8.19.2
```

2.) Clone the repository and build it using npm:

```
git clone https://github.com/LRYMND/volvo-rtvi/
cd volvo-rtvi
npm install --force
npm run build-package
```


### RasPi setup:


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

3.) Create a "startService.sh" file and add this line

```
#Execute app
/path/to/your/AppImage.AppImage --no-sandbox
```

4.) Add this line to your "/etc/xdg/lxsession/LXDE-pi/autostart"

```
#Run script after boot
bash '/path/to/your/startService.sh'
```

5.) To automatically hide the taskbar simply right-click it to activate this setting.


### Note:

The Raspberry is booting without any splash screens now and the app should open right after the login, ready to connect to your phone.

## 7 | Audio

There are a couple of ways in order to use the raspberry as an audio source for your car speakers now. I propose a [small module](https://www.tindie.com/products/justtech/aux-input-volvo-v50-s40-c30-c70-xc90/) from lithuania with which you can mod your radio to add an aux port. There's also a bluetooth version available but since the phone is already wirelessly connected to the Dongle, an aux-cable seems pretty clean and less prone to failure. 

### Note:

##### This is no advertisement, just a clean and simple solution IMO.


## 8 | Additional Information

### ToDo

- Implement RTI folding mechanism
- Implement OEM steering controls


To make life a bit easier I connected an USB extension cable to the Raspi which ends up in the tray behind the waterfall console so I can directly connect peripherals to it This also works as a charging port for a phone. It's not fast but it works.

![USB IMAGE](repo/usb.jpg?raw=true "USB")

The end goal would be to integrate the OEM control elements that are mounted to the steering wheel. It is definitely possible to read the LIN messages and forward them to the app. More infos on that can be found in LuukEsselbrugge's repositories. The carplay interface is already accepting keystrokes as input.

Since I'm lacking the hardware, this was something I couldn't implement as of now.


## 9 | Final Words

I'm not a software developer, electrical engineer or automotive technician and doing stuff like this is just a hobby for me. I'm distancing myself from any damage that you might do to your car in case you want to follow this guide. The setup I described above is the way I fitted things to my V50. Eventually you will need to find other places to mount your components and different paths to route your cables, after all it's a DIY mod.

The setup is installed in my car since several months now. I drove on the highway, over bumpy gravel roads, at 35°C in the sun and -10°C in the winter and so far it didn't let me down. It can happen that the Carplay interface freezes occasionally. In that case you can reconnect the phone or restart/reboot from the settings page. However, this rarely happens.

I'd be happy if anybody who has tips for improvement can chime in. Check out the [Swedespeed Thread](https://www.swedespeed.com/threads/volvo-rtvi-raspberry-media-can-interface.658254/) and share your ideas, findings or issues.

Last but not least, thanks again to the people who shared their code and insights and Yosh for helping me to stitch together this app.

![DEMOGIF](repo/demo.gif?raw=true "Demo")

(NOTE: Gif is lagging due to the screen recorder. In normal use all animations are smooth!)
