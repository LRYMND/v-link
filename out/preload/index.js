"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  settings: (callback) => electron.ipcRenderer.on("settings", callback),
  reverse: (callback) => electron.ipcRenderer.on("reverse", callback),
  getSettings: () => electron.ipcRenderer.send("getSettings"),
  saveSettings: (settings) => electron.ipcRenderer.send("saveSettings", settings),
  stream: (stream) => electron.ipcRenderer.send("startStream", stream),
  quit: () => electron.ipcRenderer.send("quit")
};
try {
  electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
  electron.contextBridge.exposeInMainWorld("api", api);
  electron.contextBridge.exposeInMainWorld("electronAPI", {
    settings: (callback) => electron.ipcRenderer.on("settings", callback),
    getSettings: () => electron.ipcRenderer.send("getSettings"),
    saveSettings: (settings) => electron.ipcRenderer.send("saveSettings", settings),
    stream: (stream) => electron.ipcRenderer.send("startStream", stream),
    quit: () => electron.ipcRenderer.send("quit")
  });
} catch (error) {
  console.error(error);
}
