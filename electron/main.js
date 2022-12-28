const path = require("path");
const url = require("url");
const {
  app,
  BrowserWindow,
  ipcMain,
  ipcRenderer,
  globalShortcut,
} = require("electron");
const { channels } = require("../src/shared/constants");
const { Readable } = require("stream");

// ------------------- Main Task --------------------

//Example Code
/*
ipcMain.on("show", (e, data) => {
  console.log("carplay page has been opened");
  console.log(data);
});
*/

const isDev = require("electron-is-dev");
const WebSocket = require("ws");

const mp4Reader = new Readable({
  read(size) { },
});
const Carplay = require("node-carplay");
const bindings = ["n", "v", "b", "m"];
const keys = require("./bindings.json");
let wss;
wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", function connection(ws) {
  console.log("Socket connected. sending data...");
  const wsstream = WebSocket.createWebSocketStream(ws);
  //lets pipe into jmuxer stream, then websocket
  mp4Reader.pipe(wsstream);
  ws.on("error", function error(error) {
    console.log("WebSocket error");
  });
  ws.on("close", function close(msg) {
    console.log("WebSocket close");
  });
});

//Create a wifi object to handle the network connection

var Wifi = require('rpi-wifi-connection');
var wifi = new Wifi();

function setWifiState() {
  wifi.getState().then((connected) => {
    if (connected) {
      mainWindow.webContents.send('wifi_on');
    } else {
      mainWindow.webContents.send('wifi_off');
    }
  })
    .catch((error) => {
      console.log(error);
    });
}

function getWifiNetworks() {

  wifi.scan().then((networks) => {
    mainWindow.webContents.send('wifi_list', networks);
  })
    .catch((error) => {
      console.log(error);
    });
}

const timer = setInterval(setWifiState, 5000);

//Create a bluetooth object to handle the bluetooth connection




//Create main window

let mainWindow;

function createWindow() {

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, "../index.html"),
      protocol: "file:",
      slashes: true,
    });

  globalShortcut.register("f5", function () {
    console.log("f5 is pressed");
    mainWindow.webContents.openDevTools();
  });
  if (isDev) {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 480,
      kiosk: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: false,
      },
    });
    //mainWindow.webContents.openDevTools();
  } else {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 480,
      kiosk: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: false,
      },
    });
  }
  mainWindow.removeMenu();
  mainWindow.loadURL(startUrl);

  mainWindow.on('ready-to-show', function () {
    mainWindow.show() // display after initialization
  })



  let size = mainWindow.getSize();
  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  const config = {
    dpi: 480,
    nightMode: 0,
    hand: 0,
    boxName: "nodePlay",
    width: size[0],
    height: size[1],
    fps: 60,
  };
  console.log("spawning carplay", config);
  const carplay = new Carplay(config, mp4Reader);

  carplay.on('status', (data) => {
    if (data.status) {
      mainWindow.webContents.send('plugged');
    } else {
      mainWindow.webContents.send('unplugged');
    }
    //console.log("data received", data);
  });

  carplay.on('quit', () => {
    mainWindow.webContents.send('quitReq');
    //console.log("quitReq");
  });

  ipcMain.on('click', (event, data) => {
    carplay.sendTouch(data.type, data.x, data.y);
    console.log(data.type, data.x, data.y);
  });

  ipcMain.on('statusReq', (event, data) => {
    if (carplay.getStatus()) {
      mainWindow.webContents.send('plugged');
    } else {
      mainWindow.webContents.send('unplugged');
    }
  });

  ipcMain.on('reqReload', (event) => {
    app.relaunch()
    app.quit()
  });

  ipcMain.on('reqClose', (event) => {
    app.quit()
  });

  ipcMain.on('updateWifi', (event) => {
    setWifiState();
    getWifiNetworks();
  });

  ipcMain.on('updateBT', (event) => {
    setBTState();
    getBTDevices();
  });

  for (const [key, value] of Object.entries(keys)) {
    if (isDev) {
      return;
    }
    globalShortcut.register(key, function () {
      carplay.sendKey(value);
      if (value === "selectDown") {
        setTimeout(() => {
          carplay.sendKey("selectUp");
        }, 200);
      }
    });
  }
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
    clearInterval(timer);
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// ------------------- Background Worker --------------------

// temporary variable to store data while background
// process is ready to start processing
let cache = {
  data: undefined,
};

// a window object outside the function scope prevents
// the object from being garbage collected
let hiddenWindow;

// This event listener will listen for request
// from visible renderer process
ipcMain.on('START_BACKGROUND_VIA_MAIN', (event, args) => {

  

  console.log("STARTING BACKGROUND WORKER");
  const backgroundFileURL = ""
  if(isDev) {
    backgroundFileUrl = url.format({
      pathname: path.join(__dirname, "../public/background.html"),
      protocol: "file:",
      slashes: true,
    });
  } else {
    backgroundFileUrl = url.format({
      pathname: path.join(__dirname, "../background.html"),
      protocol: "file:",
      slashes: true,
    });
  }
  hiddenWindow = new BrowserWindow({
    show: false,

    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });
  //hiddenWindow.webContents.openDevTools();

  hiddenWindow.loadURL(backgroundFileUrl);

  hiddenWindow.on('closed', () => {
    hiddenWindow = null;
  });

  cache.data = args.number;
});

// This event listener will start the execution of the
// background task
ipcMain.on('BACKGROUND_READY', (event, args) => {
  event.reply('START_PROCESSING', {
    data: cache.data,
  });
});

// This event will quit the pythong script when Dashboard
// page will be unmounted
ipcMain.on('QUIT_BACKGROUND', (event, args) => {
  hiddenWindow.webContents.send("QUIT_PYTHON");
});

// This event will quit the pythong script when Dashboard
// page will be unmounted
ipcMain.on('CLOSE_BACKGROUND', (event, args) => {
  console.log("CLOSING BACKGROUND WORKER");
  hiddenWindow.close();
});

// This event listener will listen for data being sent back
// from the background renderer process
ipcMain.on('BG_CONSOLE', (event, args) => {
  mainWindow.webContents.send('MESSAGE_FROM_BACKGROUND_VIA_MAIN', args.message);
});
