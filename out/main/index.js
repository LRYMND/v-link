"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
require("usb");
const EventEmitter = require("events");
const require$$0 = require("os");
const require$$1 = require("child_process");
const fs = require("fs");
const socketmost = require("socketmost");
const can = require("socketcan");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const can__namespace = /* @__PURE__ */ _interopNamespaceDefault(can);
const icon = path.join(__dirname, "../../resources/icon.png");
require$$0.type() == "Darwin";
require$$0.type().indexOf("Windows") > -1;
require$$1.spawn;
var AudioCommand;
(function(AudioCommand2) {
  AudioCommand2[AudioCommand2["AudioOutputStart"] = 1] = "AudioOutputStart";
  AudioCommand2[AudioCommand2["AudioOutputStop"] = 2] = "AudioOutputStop";
  AudioCommand2[AudioCommand2["AudioInputConfig"] = 3] = "AudioInputConfig";
  AudioCommand2[AudioCommand2["AudioPhonecallStart"] = 4] = "AudioPhonecallStart";
  AudioCommand2[AudioCommand2["AudioPhonecallStop"] = 5] = "AudioPhonecallStop";
  AudioCommand2[AudioCommand2["AudioNaviStart"] = 6] = "AudioNaviStart";
  AudioCommand2[AudioCommand2["AudioNaviStop"] = 7] = "AudioNaviStop";
  AudioCommand2[AudioCommand2["AudioSiriStart"] = 8] = "AudioSiriStart";
  AudioCommand2[AudioCommand2["AudioSiriStop"] = 9] = "AudioSiriStop";
  AudioCommand2[AudioCommand2["AudioMediaStart"] = 10] = "AudioMediaStart";
  AudioCommand2[AudioCommand2["AudioMediaStop"] = 11] = "AudioMediaStop";
  AudioCommand2[AudioCommand2["AudioAlertStart"] = 12] = "AudioAlertStart";
  AudioCommand2[AudioCommand2["AudioAlertStop"] = 13] = "AudioAlertStop";
})(AudioCommand || (AudioCommand = {}));
var PhoneType;
(function(PhoneType2) {
  PhoneType2[PhoneType2["AndroidMirror"] = 1] = "AndroidMirror";
  PhoneType2[PhoneType2["CarPlay"] = 3] = "CarPlay";
  PhoneType2[PhoneType2["iPhoneMirror"] = 4] = "iPhoneMirror";
  PhoneType2[PhoneType2["AndroidAuto"] = 5] = "AndroidAuto";
  PhoneType2[PhoneType2["HiCar"] = 6] = "HiCar";
})(PhoneType || (PhoneType = {}));
var MediaType;
(function(MediaType2) {
  MediaType2[MediaType2["Data"] = 1] = "Data";
  MediaType2[MediaType2["AlbumCover"] = 3] = "AlbumCover";
})(MediaType || (MediaType = {}));
var CommandMapping;
(function(CommandMapping2) {
  CommandMapping2[CommandMapping2["invalid"] = 0] = "invalid";
  CommandMapping2[CommandMapping2["startRecordAudio"] = 1] = "startRecordAudio";
  CommandMapping2[CommandMapping2["stopRecordAudio"] = 2] = "stopRecordAudio";
  CommandMapping2[CommandMapping2["requestHostUI"] = 3] = "requestHostUI";
  CommandMapping2[CommandMapping2["siri"] = 5] = "siri";
  CommandMapping2[CommandMapping2["mic"] = 7] = "mic";
  CommandMapping2[CommandMapping2["boxMic"] = 15] = "boxMic";
  CommandMapping2[CommandMapping2["enableNightMode"] = 16] = "enableNightMode";
  CommandMapping2[CommandMapping2["disableNightMode"] = 17] = "disableNightMode";
  CommandMapping2[CommandMapping2["wifi24g"] = 24] = "wifi24g";
  CommandMapping2[CommandMapping2["wifi5g"] = 25] = "wifi5g";
  CommandMapping2[CommandMapping2["left"] = 100] = "left";
  CommandMapping2[CommandMapping2["right"] = 101] = "right";
  CommandMapping2[CommandMapping2["frame"] = 12] = "frame";
  CommandMapping2[CommandMapping2["audioTransferOn"] = 22] = "audioTransferOn";
  CommandMapping2[CommandMapping2["audioTransferOff"] = 23] = "audioTransferOff";
  CommandMapping2[CommandMapping2["selectDown"] = 104] = "selectDown";
  CommandMapping2[CommandMapping2["selectUp"] = 105] = "selectUp";
  CommandMapping2[CommandMapping2["back"] = 106] = "back";
  CommandMapping2[CommandMapping2["down"] = 114] = "down";
  CommandMapping2[CommandMapping2["home"] = 200] = "home";
  CommandMapping2[CommandMapping2["play"] = 201] = "play";
  CommandMapping2[CommandMapping2["pause"] = 202] = "pause";
  CommandMapping2[CommandMapping2["next"] = 204] = "next";
  CommandMapping2[CommandMapping2["prev"] = 205] = "prev";
  CommandMapping2[CommandMapping2["requestVideoFocus"] = 500] = "requestVideoFocus";
  CommandMapping2[CommandMapping2["releaseVideoFocus"] = 501] = "releaseVideoFocus";
  CommandMapping2[CommandMapping2["wifiEnable"] = 1e3] = "wifiEnable";
  CommandMapping2[CommandMapping2["autoConnetEnable"] = 1001] = "autoConnetEnable";
  CommandMapping2[CommandMapping2["wifiConnect"] = 1002] = "wifiConnect";
  CommandMapping2[CommandMapping2["scanningDevice"] = 1003] = "scanningDevice";
  CommandMapping2[CommandMapping2["deviceFound"] = 1004] = "deviceFound";
  CommandMapping2[CommandMapping2["deviceNotFound"] = 1005] = "deviceNotFound";
  CommandMapping2[CommandMapping2["connectDeviceFailed"] = 1006] = "connectDeviceFailed";
  CommandMapping2[CommandMapping2["btConnected"] = 1007] = "btConnected";
  CommandMapping2[CommandMapping2["btDisconnected"] = 1008] = "btDisconnected";
  CommandMapping2[CommandMapping2["wifiConnected"] = 1009] = "wifiConnected";
  CommandMapping2[CommandMapping2["wifiDisconnected"] = 1010] = "wifiDisconnected";
  CommandMapping2[CommandMapping2["btPairStart"] = 1011] = "btPairStart";
  CommandMapping2[CommandMapping2["wifiPair"] = 1012] = "wifiPair";
})(CommandMapping || (CommandMapping = {}));
var MessageType;
(function(MessageType2) {
  MessageType2[MessageType2["Open"] = 1] = "Open";
  MessageType2[MessageType2["Plugged"] = 2] = "Plugged";
  MessageType2[MessageType2["Phase"] = 3] = "Phase";
  MessageType2[MessageType2["Unplugged"] = 4] = "Unplugged";
  MessageType2[MessageType2["Touch"] = 5] = "Touch";
  MessageType2[MessageType2["VideoData"] = 6] = "VideoData";
  MessageType2[MessageType2["AudioData"] = 7] = "AudioData";
  MessageType2[MessageType2["Command"] = 8] = "Command";
  MessageType2[MessageType2["LogoType"] = 9] = "LogoType";
  MessageType2[MessageType2["DisconnectPhone"] = 15] = "DisconnectPhone";
  MessageType2[MessageType2["CloseDongle"] = 21] = "CloseDongle";
  MessageType2[MessageType2["BluetoothAddress"] = 10] = "BluetoothAddress";
  MessageType2[MessageType2["BluetoothPIN"] = 12] = "BluetoothPIN";
  MessageType2[MessageType2["BluetoothDeviceName"] = 13] = "BluetoothDeviceName";
  MessageType2[MessageType2["WifiDeviceName"] = 14] = "WifiDeviceName";
  MessageType2[MessageType2["BluetoothPairedList"] = 18] = "BluetoothPairedList";
  MessageType2[MessageType2["ManufacturerInfo"] = 20] = "ManufacturerInfo";
  MessageType2[MessageType2["HiCarLink"] = 24] = "HiCarLink";
  MessageType2[MessageType2["BoxSettings"] = 25] = "BoxSettings";
  MessageType2[MessageType2["MediaData"] = 42] = "MediaData";
  MessageType2[MessageType2["SendFile"] = 153] = "SendFile";
  MessageType2[MessageType2["HeartBeat"] = 170] = "HeartBeat";
  MessageType2[MessageType2["SoftwareVersion"] = 204] = "SoftwareVersion";
})(MessageType || (MessageType = {}));
var TouchAction;
(function(TouchAction2) {
  TouchAction2[TouchAction2["Down"] = 14] = "Down";
  TouchAction2[TouchAction2["Move"] = 15] = "Move";
  TouchAction2[TouchAction2["Up"] = 16] = "Up";
})(TouchAction || (TouchAction = {}));
var FileAddress;
(function(FileAddress2) {
  FileAddress2["DPI"] = "/tmp/screen_dpi";
  FileAddress2["NIGHT_MODE"] = "/tmp/night_mode";
  FileAddress2["HAND_DRIVE_MODE"] = "/tmp/hand_drive_mode";
  FileAddress2["CHARGE_MODE"] = "/tmp/charge_mode";
  FileAddress2["BOX_NAME"] = "/etc/box_name";
  FileAddress2["OEM_ICON"] = "/etc/oem_icon.png";
  FileAddress2["AIRPLAY_CONFIG"] = "/etc/airplay.conf";
  FileAddress2["ICON_120"] = "/etc/icon_120x120.png";
  FileAddress2["ICON_180"] = "/etc/icon_180x180.png";
  FileAddress2["ICON_250"] = "/etc/icon_256x256.png";
  FileAddress2["ANDROID_WORK_MODE"] = "/etc/android_work_mode";
})(FileAddress || (FileAddress = {}));
var LogoType;
(function(LogoType2) {
  LogoType2[LogoType2["HomeButton"] = 1] = "HomeButton";
  LogoType2[LogoType2["Siri"] = 2] = "Siri";
})(LogoType || (LogoType = {}));
var HandDriveType;
(function(HandDriveType2) {
  HandDriveType2[HandDriveType2["LHD"] = 0] = "LHD";
  HandDriveType2[HandDriveType2["RHD"] = 1] = "RHD";
})(HandDriveType || (HandDriveType = {}));
const DEFAULT_CONFIG = {
  width: 800,
  height: 640,
  fps: 20,
  dpi: 160,
  format: 5,
  iBoxVersion: 2,
  phoneWorkMode: 2,
  packetMax: 49152,
  boxName: "nodePlay",
  nightMode: false,
  hand: HandDriveType.LHD,
  mediaDelay: 300,
  audioTransferMode: false,
  wifiType: "5ghz",
  micType: "os",
  phoneConfig: {
    [PhoneType.CarPlay]: {
      frameInterval: 5e3
    },
    [PhoneType.AndroidAuto]: {
      frameInterval: null
    }
  }
};
class PiMost {
  constructor() {
    console.log("creating client in PiMost");
    this.socketMost = new socketmost.SocketMost();
    this.socketMostClient = new socketmost.SocketMostClient();
  }
  stream(stream) {
    this.socketMostClient.stream(stream);
  }
}
class Canbus extends EventEmitter {
  constructor(canChannel, subscriptions = {}) {
    super();
    this.canChannel = canChannel;
    this.subscriptions = subscriptions;
    this.channel = can__namespace.createRawChannel(this.canChannel);
    this.masks = [];
    this.reverse = false;
    this.lights = false;
    Object.keys(this.subscriptions).forEach((sub) => {
      this.masks.push({ id: this.subscriptions[sub].canId, mask: this.subscriptions[sub].canId, invert: false });
    });
    this.channel.setRxFilters(this.masks);
    this.channel.addListener("onMessage", (msg) => {
      let data;
      switch (msg.id) {
        case this.subscriptions?.reverse?.canId:
          data = msg.data[this.subscriptions.reverse.byte] & this.subscriptions.reverse.mask;
          let tempReverse = this.reverse;
          if (data) {
            tempReverse = true;
          } else {
            tempReverse = false;
          }
          if (tempReverse !== this.reverse) {
            this.emit("reverse", this.reverse);
          }
          break;
        case this.subscriptions?.lights?.canId:
          let tempLights = this.lights;
          data = msg.data[this.subscriptions.reverse.byte] & this.subscriptions.reverse.mask;
          if (data) {
            tempLights = true;
          } else {
            tempLights = false;
          }
          if (tempLights !== this.lights) {
            this.emit("lights", this.lights);
          }
          break;
      }
    });
    this.channel.start();
  }
}
let mainWindow;
const appPath = electron.app.getPath("userData");
const configPath = appPath + "/config.json";
console.log(configPath);
let config;
const DEFAULT_BINDINGS = {
  left: "ArrowLeft",
  right: "ArrowRight",
  selectDown: "Space",
  back: "Backspace",
  down: "ArrowDown",
  home: "KeyH",
  play: "KeyP",
  pause: "KeyO",
  next: "KeyM",
  prev: "KeyN"
};
const EXTRA_CONFIG = {
  ...DEFAULT_CONFIG,
  kiosk: true,
  camera: "",
  microphone: "",
  piMost: false,
  canbus: false,
  bindings: DEFAULT_BINDINGS,
  most: {},
  canConfig: {}
};
let piMost;
let canbus;
fs__namespace.exists(configPath, (exists) => {
  if (exists) {
    config = JSON.parse(fs__namespace.readFileSync(configPath).toString());
    let configKeys = JSON.stringify(Object.keys({ ...config }).sort());
    let defaultKeys = JSON.stringify(Object.keys({ ...EXTRA_CONFIG }).sort());
    if (configKeys !== defaultKeys) {
      console.log("config updating");
      config = { ...EXTRA_CONFIG, ...config };
      console.log("new config", config);
      fs__namespace.writeFileSync(configPath, JSON.stringify(config));
    }
    console.log("config read");
  } else {
    fs__namespace.writeFileSync(configPath, JSON.stringify(EXTRA_CONFIG));
    config = JSON.parse(fs__namespace.readFileSync(configPath).toString());
    console.log("config created and read");
  }
  if (config.most) {
    console.log("creating pi most in main");
    piMost = new PiMost();
  }
  if (config.canbus) {
    canbus = new Canbus("can0", config.canConfig);
    canbus.on("lights", (data) => {
      console.log("lights", data);
    });
    canbus.on("reverse", (data) => {
      mainWindow?.webContents?.send("reverse", data);
    });
  }
});
const handleSettingsReq = (_) => {
  console.log("settings request");
  mainWindow?.webContents.send("settings", config);
};
electron.app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
electron.app.commandLine.appendSwitch("disable-webusb-security", "true");
console.log(electron.app.commandLine.hasSwitch("disable-webusb-security"));
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: config.width,
    height: config.height,
    kiosk: config.kiosk,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false
    }
  });
  electron.app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
  mainWindow.webContents.session.setPermissionCheckHandler(() => {
    return true;
  });
  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.device.vendorId === 4884) {
      return true;
    } else {
      return false;
    }
  });
  mainWindow.webContents.session.on("select-usb-device", (event, details, callback) => {
    event.preventDefault();
    const selectedDevice = details.deviceList.find((device) => {
      return device.vendorId === 4884 && (device.productId === 5408 || device.productId === 5408);
    });
    callback(selectedDevice?.deviceId);
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  electron.app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
  electron.systemPreferences.askForMediaAccess("microphone");
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    details.responseHeaders["Cross-Origin-Opener-Policy"] = ["same-origin"];
    details.responseHeaders["Cross-Origin-Embedder-Policy"] = ["require-corp"];
    callback({ responseHeaders: details.responseHeaders });
  });
}
electron.app.commandLine.appendSwitch("enable-experimental-web-platform-features");
electron.app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp"
      }
    });
  });
  electron.ipcMain.on("getSettings", handleSettingsReq);
  electron.ipcMain.on("saveSettings", saveSettings);
  electron.ipcMain.on("startStream", startMostStream);
  electron.ipcMain.on("quit", quit);
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
const saveSettings = (_, settings) => {
  fs__namespace.writeFileSync(configPath, JSON.stringify(settings));
};
const startMostStream = (_, most) => {
  console.log("stream request");
  if (piMost) {
    piMost.stream(most);
  }
};
const quit = (_) => {
  electron.app.quit();
};
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
