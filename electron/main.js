const path = require("path");
const url = require("url");
const {
  app,
  BrowserWindow,
  ipcMain,
  ipcRenderer,
  globalShortcut,
} = require("electron");

app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');

const isDev = require("electron-is-dev");


// ------------------- Electron Store --------------------

const UserSettings = require('./UserSettings');
const settings = new UserSettings;
//settings.initRenderer();

//const ElectronStore = require('electron-store');
//const store = new ElectronStore({ schema });
//ElectronStore.initRenderer();

console.log("Current Theme: ", settings.store.get("colorTheme"));

// ------------------- Carplay Setup --------------------

const { Readable } = require("stream");
const WebSocket = require("ws");
const mp4Reader = new Readable({
  read(size) { },
});
const Carplay = require("node-carplay");
const bindings = ["n", "v", "b", "m"];
const keys = require("./bindings.json");
let wss;
wss = new WebSocket.Server({ port: 3001, perMessageDeflate: false });

wss.on("connection", function connection(ws) {
  console.log("Socket connected. sending data...");
  const wsstream = WebSocket.createWebSocketStream(ws);
    //lets pipe into jmuxer stream, then websocket
    mp4Reader.pipe(wsstream);
    ws.on('error', function error(error) {
        console.log('WebSocket error');
    });
    ws.on('close', function close(msg) {
        console.log('WebSocket close');
    });
});

// ------------------- Wifi Setup --------------------

var Wifi = require('rpi-wifi-connection');
var wifi = new Wifi();


const timer = setInterval(setWifiIconState, 5000); //Update status-icon every 5 Seconds

function setWifiIconState() {
  getWifiStatus();

  /*
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
    */
}

function getWifiStatus() {
  wifi.getStatus().then((status) => {
    if (status.ssid != null && status.ip_address != null) {
      mainWindow.webContents.send('wifi_on', status);
      console.log(status);
    } else {
      mainWindow.webContents.send('wifi_off');
    }
  })
    .catch((error) => {
      mainWindow.webContents.send('wifi_off');
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

function connectWifi(data) {
  wifi.connect({ ssid: data.ssid, psk: data.password }).then(() => {

    wifi.getStatus().then((status) => {
      mainWindow.webContents.send('wifi_connected', ("Connected with IP: " + status.ip_address));
    })
    console.log('Connected to WiFi network.');
  })
    .catch((error) => {
      mainWindow.webContents.send('wifi_connected', 'Could not connect.');
      console.log(error);
    });
}

// ------------------- Bluetooth Setup --------------------
//ToDo...


// ------------------- User Setup --------------------

function runScripts() {
  if (settings.store.get("activateCC")) { script(1); }
  //if (store.get("activateCAN")) { console.log("ACTIVATE CAN"); }
  //if (store.get("activateMMI")) { console.log("ACTIVATE MMI"); }
}

function script(option) {
  console.log("Option ", option);
  const { PythonShell } = require('python-shell');
  const script1 = path.join(process.resourcesPath, '/scripts/cruisecontrol.py');
  const script2 = path.join(process.resourcesPath, '/scripts/faultcodes.py');

  let pyshell;

  if (option === 1) {
    console.log("Activating cruise-control.")
    pyshell = new PythonShell(script1, {
      pythonPath: 'python',
      pythonOptions: ['-u'],
    });
  }

  if (option === 2) {
    console.log("Clearing 2-byte DTCs.")
    pyshell = new PythonShell(script2, {
      pythonPath: 'python',
      pythonOptions: ['-u'],
    });
  }


  pyshell.on('message', function (msg) {
    console.log("Script Message:", { message: msg });
  });

  pyshell.on('error', function (error) {
    console.log("Script Message:", { message: error });
  });

  pyshell.on('stderr', function (stderr) {
    console.log("Script Message:", { message: stderr });
  });
}



// ------------------- Main Window --------------------

let mainWindow = null;

function createWindow() {
  //Run user scripts
  runScripts();

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
      kiosk: false,
      show: false,
      backgroundColor: '#000000',

      webPreferences: {
        nodeIntegration: true,
        //enableRemoteModule: true
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: false,
      },
    });

    mainWindow.webContents.openDevTools();

  } else {

    mainWindow = new BrowserWindow({
      width: 800,
      height: 480,
      kiosk: false,
      show: false,
      backgroundColor: '#000000',

      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: false
      }
    });
  }

  mainWindow.removeMenu();
  mainWindow.loadURL(startUrl);

  mainWindow.on('ready-to-show', function () {
    console.log("Window READY")
    if (!isDev) { mainWindow.setKiosk(true); }
    mainWindow.show();
  });

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
    console.log("data received", data);
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

  ipcMain.on('reqReload', () => {
    app.relaunch()
    app.quit();
  });

  ipcMain.on('reqClose', () => {
    app.quit();
  });

  ipcMain.on('reqReboot', () => {
    const exec = require('child_process').exec;
    exec('sudo reboot -h now', (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      console.log(error);
    });
  });

  ipcMain.on('updateWifi', () => {
    setWifiIconState();
    getWifiNetworks();
  });

  ipcMain.on('connectWifi', (event, data) => {
    connectWifi(data);
  });

  ipcMain.on('updateBT', () => {
    setBTState();
    getBTDevices();
  });

  ipcMain.on('getSettings', () => {
    mainWindow.webContents.send('allSettings', settings.store.store)
  })

  ipcMain.on('settingsUpdate', (event, { type, value }) => {
    console.log("updating settings", type, value)
    settings.store.set(type, value)
    mainWindow.webContents.send('allSettings', settings.store.store)
  })


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

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
    clearInterval(timer);
  }
});

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
    clearInterval(timer);
  }
});


// ------------------- Background Worker --------------------

// temporary variable to store data while background process is ready to start processing
let cache = {
  data: undefined,
};

// a window object outside the function scope prevents the object from being garbage collected
let hiddenWindow;

// This event listener will listen for request from visible renderer process
ipcMain.on('START_BACKGROUND_VIA_MAIN', (event, args) => {

  if (settings.store.get("activateCAN")) {
    console.log("STARTING BACKGROUND WORKER");
    const backgroundFileURL = ""



    if (isDev) {
      backgroundFileUrl = url.format({
        pathname: path.join(__dirname, "../public/background.html"),
        protocol: "file:",
        slashes: true,
      });

      hiddenWindow = new BrowserWindow({
        width: 150,
        height: 150,
        show: true,

        webPreferences: {
          nodeIntegration: true,
          enableRemoteModule: true,
          contextIsolation: false,
        },
      });

      hiddenWindow.webContents.openDevTools();

    } else {

      backgroundFileUrl = url.format({
        pathname: path.join(__dirname, "../background.html"),
        protocol: "file:",
        slashes: true,
      });

      hiddenWindow = new BrowserWindow({
        show: false,

        webPreferences: {
          nodeIntegration: true,
          enableRemoteModule: true,
          contextIsolation: false,
        },
      });
    }

    hiddenWindow.loadURL(backgroundFileUrl);

    hiddenWindow.on('closed', () => {
      hiddenWindow = null;
    });

    cache.data = args.number;
  } else {
    console.log("CAN-stream deactivated.")
  }
});


// This event listener will start the execution of the background task
ipcMain.on('BACKGROUND_READY', (event, args) => {
  event.reply('START_PROCESSING', {
    data: cache.data,
  });
});

// This event will quit the python script when Dashboard page will be unmounted
ipcMain.on('QUIT_BACKGROUND', (event, args) => {
  if (hiddenWindow != null) {
    hiddenWindow.webContents.send("QUIT_PYTHON");
  }
});

// This event will quit the python script when Dashboard page will be unmounted
ipcMain.on('CLOSE_BACKGROUND', (event, args) => {
  console.log("CLOSING BACKGROUND WORKER");
  hiddenWindow.close();
});

// This event listener will listen for data being sent back from the background renderer process
ipcMain.on('BG_CONSOLE', (event, args) => {
  console.log(args.message);
  mainWindow.webContents.send('MESSAGE_FROM_BACKGROUND_VIA_MAIN', args.message)
});
