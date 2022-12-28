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
    <li><a>| ToDo</a></li>
    <li><a>| Final Words</a></li>
  </ol>
</details>

## 1 | Hardware

In order to get this build running you will need the following hardware. Tools and materials like wires or zipties are not included. The display components are optional but the one I'm proposing has a much better resolution than the original one. If you want to use the original display you can find a way to do so in the repositories from laurynas.

* [MCP2515 CAN Module](https://www.amazon.de/-/en/Intelligent-Electronics-Receiver-Controller-Development/dp/B07MY2D7TW/ref=sr_1_6?keywords=mcp2515&qid=1662026860&sr=8-6)
* [LCD Driver](https://de.aliexpress.com/item/4001175095149.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [LCD Display](https://de.aliexpress.com/item/32835602509.html?spm=a2g0o.order_list.0.0.30e65c5fXw0Aa6&gatewayAdapt=glo2deu)
* [12V to 5V Buck Converter, 5A](https://www.amazon.de/gp/product/B071ZRXKJY/ref=ppx_yo_dt_b_asin_title_o06_s00?ie=UTF8&psc=1)

* [Carlinkit Adapter](https://www.amazon.de/CarlinKit-Wireless-CarPlay-Aftermarket-Mirroring-Black/dp/B09ZPBL4HP/ref=sr_1_18_sspa?keywords=Carlinkit&qid=1662026978&sr=8-18-spons&psc=1&smid=AWLAK6Y9FEYBP&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFLQVVHRlBSTkdIT0cmZW5jcnlwdGVkSWQ9QTA2NzUwNDAzTjhaUjJJQkQ1N0xXJmVuY3J5cHRlZEFkSWQ9QTAwNDAzNTMyNVdPTUdaM1VTQU8wJndpZGdldE5hbWU9c3BfbXRmJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==)
* [12V 5A Fuse](https://www.amazon.de/Neuftech%C2%AE-Sicherungshalter-Flachsicherung-Sicherung-wasserdicht/dp/B00UX6NIQE/ref=asc_df_B00UX6NIQE/?tag=googshopde-21&linkCode=df0&hvadid=310359968785&hvpos=&hvnetw=g&hvrand=13883660999016731185&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9043309&hvtargid=pla-561148277227&psc=1&th=1&psc=1&tag=&ref=&adgrpid=62443302395&hvpone=&hvptwo=&hvadid=310359968785&hvpos=&hvnetw=g&hvrand=13883660999016731185&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9043309&hvtargid=pla-561148277227)
- Raspberry PSU as described in this Readme
- OEM P1 RTI Display Unit
- Raspberry Pi

I advise to go for a Raspi 4 because the performance will be better but a Raspi 3 should work as well. Not tested though!

## 2 | Display Mod

To swap the display, you will have to disassemble your original RTI unit and take all the display components out. Afterwards you glue the new display in place. I also mounted the buck converter and the display driver on the backside of the LCD panel because there is some space, and space is limited with this build. More information can also be found in laurynas' repo.

![SCREENMOD IMAGE](repo/screenmod.jpg?raw=true "Screen Mod")


## 3 | Raspberry PSU

Available solutions are way too bulky and I wanted a clean setup with some critical demands:

- Raspi boots when igniton is ON
- Raspi gracefully shuts off when ignition turns off (via shutdown -h command)
- Little to no power is consumed in the off state

I went through many different forums and articles until I found a neat solution which is described in the article mentioned in the sources. After ordering the PCB and soldering the components I noticed that the circuit was not functioning as expected. Once the ignition was off the Raspberry would immediatley turn back on again.

In short, here are the reasons why:
- Capacitance of the buck converter itself
- Floating states on Q2/Q3

You can find an updated and working schematic in the schematics folder of this repository. As stated in the original article, it is adviseable to put a heatsink on the big transistor. If you want to know more about the issue and the solution you can follow this [link](https://forum.core-electronics.com.au/t/pi-power-switch-using-car-ignition-logic/6177/7).



## 4 | CAN Implementation

Since the Raspberry has the ability to communicate with a CAN network it would be a shame not to use this. The only thing you will need for this is a MCP2515 module and some scripting. In order to connect your Raspi with the module you can follow this [link](https://forums.raspberrypi.com/viewtopic.php?t=296117).

Make sure that you also set up the automatic can channel activation on boot!


## 5 | RTVI App

As mentioned above, I used node.js, electron and react to set up a custom application in the fashion of Rhys Morgan's "react-carplay", though the only component I reused was his node-carplay npm package. Kudos to him at this point for figuring all this out and helping me to troubleshoot some things along the way.

![CARPLAY IMAGE](repo/carplay.jpg?raw=true "Carplay")

I would say that the app is in a usable beta-stage and I engourage anyone to help me improve it. In this repository you can find the full source code and altering it to your needs is quiet straight forward. For example to change the displayed CAN data, you will only have to make a few changes to python.py and Dashboard.js. In order to use Carplay/Android Auto you will need to have a Carlinkit adpater.

NOTE: Your Raspi needs a working internet connection when you launch the app for the first time because it needs to download some resources for the dongle. You can find more information in Rhys' repositories or in the source code.


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
sudo ./App.AppImage --no-sandbox
```


### Building the app:


1.) Install prerequisites:

```
sudo apt-get install libudev-dev
sudo apt-get install python-can
sudo apt-get install npm
sudo npm install -g n
sudo n 16.19.0
```

2.) Clone the repository and build it using npm:

```
git clone https://github.com/LRYMND/volvo-rtvi/
cd volvo-rtvi
npm install --force
npm run build-package
```


### RasPi setup:


1.) Add these lines to your "/boot/config.txt" so the Raspberry shuts down gracefully and removes power from the PSU:

```
dtoverlay=gpio-shutdown,active_low=0,gpio_pull=up
dtoverlay=gpio-poweroff
```

2.) In order to have a black screen until the Raspi is fully booted, add this to your "/boot/config.txt":

```
# Disable rainbow image at boot
disable_splash=1
```

3.) Open "/boot/cmdline.txt" and add this at the end of the line:

```
logo.nologo vt.global_cursor_default=0
```

4.) Create a "startService.sh" file and add this line:

```
sudo /path/to/your/AppImage.AppImage --no-sandbox
```

5.) Add this line to your "/etc/xdg/lxsession/LXDE-pi/autostart" so the app runs directly after booting:

```
@bash '/path/to/your/startService.sh'
```

6.) To automatically hide the taskbar you can simply right-click it to activate this setting.


### Notes:


The Raspberry should be booting fairly clean now and the app should open right after the boot process, ready to connect to your phone.

Since there is now a working media interface in the car, we can add it as an audio source. For this you can use the aux port of the Raspi and mod the radio with this little module from Lithuania: [V50 Aux-Input](https://dontpressthat.wordpress.com/2017/10/13/in-car-raspberry-pi-psu-controller/)

He also got a bluetooth version available but since the phone is already wirelessly connected to the Dongle, why not running a simple aux-cable from the Raspi to the radio? It's clean and less prone to failure. 

#### -> This is no advertisement, just a clean and simple solution IMO.


## 8 | ToDo

- Implement RTI folding mechanism
- Implement OEM steering controls
- Implement Schematic for Touchscreen
- Rework settings page

At first I was controlling the Software via mouse/keyboard. However there is a [touch screen module](https://www.ebay.de/itm/170981315406) which I recently installed and is working great so far. There were just some small changes I had to make to the touch input matrix because the Y-axis was flipped. It's not as smooth as the touch input on your smartphone but it is definitely usable and way more comfortable than whipping out a keyboard each and every time so I'd recommend to go for this straight away. I mounted the touch controller to the back of the display next to the buck converter. I also added a USB extension cable to the Raspi which ends up in the tray behind my waterfall so I can directly connect peripherals. This also works as a charging port for a phone. It's not fast but it works.

![USB IMAGE](repo/usb.jpg?raw=true "USB")

The end goal would be to integrate the OEM control elements that are mounted to the steering wheel. It is definitely possible to read these LIN commands with an arduino and forward them to the app. Infos on that can be found in LuukEsselbrugge's repositories. The carplay interface is already accepting keystrokes as input. Since I'm lacking the hardware, this was something I couldn't implement as of now.


## 9 | Final Words

I'm not a software developer, electrical engineer or automotive technician and doing stuff like this is purely a hobby for me. I'm distancing myself from any damage that you might do to your car in case you would like to give this mod a try. The setup I described above is the way I fitted things to my V50. Eventually you will need to find other places to mount your components and different paths to route your cables than I did, after all it's a DIY mod.

That said, with this guide it should be quiet straight forward to implement it in your car though.  I'm running the setup since several months now. On the highway, over bumpy gravel roads, at 35°C in the sun and -5°C in the winter and so far it didn't let me down. It froze or lagged a couple of times but I could either reconnect the phone or restart the app via the settings page and it would work again for the rest of the ride. However this occurs very rarely. 

I'd be happy if anybody who has tips for improvement can chime in and report their findings or ideas so the app can be further developed. For that matter I set up a [Swedespeed Thread](https://www.swedespeed.com/threads/volvo-rtvi-raspberry-media-can-interface.658254/).

Last but not least, thanks again to the people who shared their code and insights and Yosh for helping me to stitch together this app.

![DEMOGIF](repo/demo.gif?raw=true "Demo")

(NOTE: Gif is lagging due to the screen recorder. In normal use all animations are smooth!)
