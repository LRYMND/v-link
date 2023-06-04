const path = require('path');
const url = require('url');
const {
  app,
  BrowserWindow,
  ipcMain,
  ipcRenderer,
  globalShortcut,
} = require('electron');

//app.commandLine.appendSwitch('disable-gpu-vsync');
//app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-gpu');
//app.commandLine.appendSwitch('disable-gpu-compositing');

const isDev = require('electron-is-dev');


// ------------------- Electron Store --------------------

const Settings = require('./settings');
const settings = new Settings;


// ------------------- Wifi Setup --------------------

var Wifi = require('rpi-wifi-connection');
var wifi = new Wifi();

const timer = setInterval(getWifiStatus, 5000); //Update status-icon every 5 Seconds

function getWifiStatus() {
  wifi.getStatus().then((status) => {
    if (status.ssid != null && status.ip_address != null) {
      mainWindow.webContents.send('wifiOn', status);
      //console.log(status);
    } else {
      mainWindow.webContents.send('wifiOff');
    }
  })
    .catch((error) => {
      mainWindow.webContents.send('wifiOff');
      console.log('error: ', error);
    });
}

function getWifiNetworks() {
  wifi.scan().then((networks) => {
    mainWindow.webContents.send('wifiList', networks);
  })
    .catch((error) => {
      console.log('error: ', error);
    });
}

function connectWifi(data) {
  wifi.connect({ ssid: data.ssid, psk: data.password }).then(() => {

    wifi.getStatus().then((status) => {
      mainWindow.webContents.send('wifiConnected', ('Connected with IP: ' + status.ip_address));
    })
    console.log('Connected to WiFi network.');
  })
    .catch((error) => {
      mainWindow.webContents.send('wifiConnected', 'Could not connect.');
      console.log('error: ', error);
    });
}

ipcMain.on('wifiUpdate', () => {
  getWifiStatus();
  getWifiNetworks();
});

ipcMain.on('wifiConnect', (event, data) => {
  connectWifi(data);
});

// ------------------- Bluetooth Setup --------------------
//ToDo...


// ------------------- Carplay Init --------------------

const { Readable } = require('stream');
const Carplay = require('node-carplay');

const mp4Reader = new Readable({ read(size) { }, });
const keys = require('./bindings.json');


// ------------------- Main Window --------------------

let mainWindow;

function createWindow() {
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '../index.html'),
      protocol: 'file:',
      slashes: true,
    });

  globalShortcut.register('f5', function () {
    console.log('opening dev tools');
    mainWindow.webContents.openDevTools();
  });

  if (isDev || !(settings.store.get('kiosk'))) {
    mainWindow = new BrowserWindow({
      width: settings.store.get('windowWidth'),
      height: settings.store.get('windowHeight'),
      kiosk: false,
      show: false,
      backgroundColor: '#000000',

      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: false,
      },
    });

    mainWindow.webContents.openDevTools();

  } else {

    mainWindow = new BrowserWindow({
      width: settings.store.get('windowWidth'),
      height: settings.store.get('windowHeight'),
      kiosk: false,
      show: false,
      frame: false,
      resizable: false,

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
    console.log('window ready')
    if (!isDev) { mainWindow.setKiosk(true); }
    mainWindow.show();
  });

  let size = mainWindow.getSize();
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  const config = {
    dpi: settings.store.get('dpi'),
    nightMode: 0,
    hand: settings.store.get('lhd'),
    boxName: 'nodePlay',
    width: settings.store.get('width'),
    height: settings.store.get('height'),
    fps: settings.store.get('fps'),
  };

  // ------------------- Carplay Setup --------------------
 
  console.log('spawning carplay: ', config);
  const carplay = new Carplay(config);

  carplay.on('quit', () => {
    console.log('exiting carplay');
    mainWindow.webContents.send('quitReq');
  });

  ipcMain.on('click', (event, data) => {
    carplay.sendTouch(data.type, data.x, data.y);
    console.log('click: ', data.type, data.x, data.y);
  });

  ipcMain.on('fpsReq', (event) => {
    event.returnValue = settings.store.get('fps')
  });

  ipcMain.on('statusReq', (event, data) => {
    if (carplay.getStatus()) {
      mainWindow.webContents.send('plugged');
    } else {
      mainWindow.webContents.send('unplugged');
    }
  });

  ipcMain.on('getSettings', () => {
    console.log(settings.store.store)
    mainWindow.webContents.send('allSettings', settings.store.store)
  });

  ipcMain.on('settingsUpdate', (event, { setting, value }) => {
    console.log('updating settings', setting, value)
    settings.store.set(setting, value)
    mainWindow.webContents.send('allSettings', settings.store.store)
  });

  ipcMain.on('reqReload', () => {
    app.relaunch();
    app.exit();
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


  for (const [key, value] of Object.entries(keys)) {
    if (isDev) {
      return;
    }
    globalShortcut.register(key, function () {
      carplay.sendKey(value);
      if (value === 'selectDown') {
        setTimeout(() => {
          carplay.sendKey('selectUp');
        }, 200);
      }
    });
  }

}

function startUp () {
  createWindow();
  createBackgroundWorker();
}

app.on('ready', function() {
  //createWindow();
  startUp();
});
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
    clearInterval(timer);
  }
});

/*
app.on('activate', function () {
  if (mainWindow === null) {
    //startUp();
    createWindow();
  }
});
*/


// ------------------- Background Worker --------------------

let cache = {
  data: undefined,
};

let hiddenWindow;

function createBackgroundWorker() {

  let cache = {
    data: undefined,
  };

  if (settings.store.get('activateCAN')) {
    console.log('starting background worker');
    const backgroundFileURL = ''



    if (isDev) {
      backgroundFileUrl = url.format({
        pathname: path.join(__dirname, '../public/background.html'),
        protocol: 'file:',
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

      //hiddenWindow.webContents.openDevTools();

    } else {

      backgroundFileUrl = url.format({
        pathname: path.join(__dirname, '../background.html'),
        protocol: 'file:',
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

    //cache.data = args.number;
  } else {
    console.log('can-stream deactivated.')
  }
}


// Script Setup
ipcMain.on('backgroundReady', (event, args) => {
  event.reply('startPython', {
    data: cache.data,
  });
});

ipcMain.on('stopScript', (event, args) => {
  if (hiddenWindow != null) {
    hiddenWindow.webContents.send('stopPython');
  }
});

ipcMain.on('backgroundClose', (event, args) => {
  console.log('closing background worker');
  hiddenWindow.close();
});

ipcMain.on('msgToMain', (event, args) => {
  //console.log('debug: ', args.message);
  mainWindow.webContents.send('msgFromBackground', args.message);
});
