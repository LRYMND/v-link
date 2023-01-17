import React from "react";
import { useState, useEffect } from "react";
import "../components/themes.scss"
import "./topbar.scss";

const electron = window.require('electron');
const { ipcRenderer } = electron;

const TopBar = () => {

  const Store = window.require('electron-store');
  const store = new Store();
  const theme = store.get("colorTheme");

  const [time, setDate] = useState(new Date());

  const [wifiState, setWifiState] = useState("disconnected");
  const [phoneState, setPhoneState] = useState("disconnected");


  const wifiOn = () => {
    setWifiState("connected");
  }

  const wifiOff = () => {
    setWifiState("disconnected");
  }

  const plugged = () => {
    setPhoneState("connected");
  }

  const unplugged = () => {
    setPhoneState("disconnected");
  }

  function updateTime() {
    setDate(new Date());
  }


  useEffect(() => {
    const timer1 = setInterval(updateTime, 10000);

    ipcRenderer.send('statusReq');
    ipcRenderer.send('updateWifi');

    ipcRenderer.on('wifiOn', wifiOn);
    ipcRenderer.on('wifiOff', wifiOff);
    ipcRenderer.on("plugged", plugged);
    ipcRenderer.on("unplugged", unplugged);

    document.body.className = theme;

    return function cleanup() {
      clearInterval(timer1);

      ipcRenderer.removeListener('wifiOn', wifiOn);
      ipcRenderer.removeListener('wifiOff', wifiOff);
      ipcRenderer.removeListener('plugged', plugged);
      ipcRenderer.removeListener('unplugged', unplugged);
    };
  }, []);

  return (
    <div className={`topbar ${theme}`}>
      <div className="topbar__info">
        <svg className={`topbar__icon topbar__icon--${wifiState}`}>
          <use xlinkHref="./svg/wifi.svg#wifi"></use>
        </svg>
        <svg className={`topbar__icon topbar__icon--${'disconnected'}`}>
          <use xlinkHref="./svg/bluetooth.svg#bluetooth"></use>
        </svg>
        <svg className={`topbar__icon topbar__icon--${phoneState}`}>
          <use xlinkHref="./svg/phone.svg#phone"></use>
        </svg>
      </div>
      <div>
        <div className="topbar__banner">
          <svg className="topbar__banner__graphic">
            <use xlinkHref="./svg/banner.svg#banner"></use>
          </svg>
        </div>
      </div>
      <div className="topbar__time">
        <div className="topbar__time__container">
          <h2>{time.toLocaleTimeString('sv-SV', { hour: '2-digit', minute: '2-digit' })} </h2>
        </div>
      </div>
    </div>

  );
};

export default TopBar;
