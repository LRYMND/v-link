import React from "react";
import { useState, useEffect } from "react";
import "../components/themes.scss"
import "./topbar.scss";
import TopBarBackground from "./images/topbar.png";

const electron = window.require('electron');
const { ipcRenderer } = electron;

const TopBar = () => {

  const Store = window.require('electron-store');
  const store = new Store();
  const theme = store.get("colorTheme");

  const [time, setDate] = useState(new Date());

  const [wifiState, setWifiState] = useState("disconnected");
  const [phoneState, setPhoneState] = useState("unplugged");


  const wifiOn = () => {
    setWifiState("connected");
  }

  const wifiOff = () => {
    setWifiState("disconnected");
  }

  const plugged = () => {
    setPhoneState("plugged");
  }

  const unplugged = () => {
    setPhoneState("unplugged");
  }

  function updateTime() {
    setDate(new Date());
  }


  useEffect(() => {
    const timer1 = setInterval(updateTime, 10000);

    ipcRenderer.send('statusReq');
    ipcRenderer.send('updateWifi');

    ipcRenderer.on('wifi_on', wifiOn);
    ipcRenderer.on('wifi_off', wifiOff);
    ipcRenderer.on("plugged", plugged);
    ipcRenderer.on("unplugged", unplugged);

    document.body.className = theme;

    return function cleanup() {
      clearInterval(timer1);

      ipcRenderer.removeListener('wifi_on', wifiOn);
      ipcRenderer.removeListener('wifi_off', wifiOff);
      ipcRenderer.removeListener('plugged', plugged);
      ipcRenderer.removeListener('unplugged', unplugged);
    };
  }, [theme]);

  return (
    <div className={`topbar ${theme}`} style={{ backgroundImage: `url(${TopBarBackground})`}}>
      <div className={"topbar__info"}>
          <svg className={`topbar__icon__wifi topbar__icon__wifi--${wifiState}`}>
            <use xlinkHref="./svg/wifi.svg#wifi"></use>
          </svg>
          <svg className={`topbar__icon__bluetooth`}>
            <use xlinkHref="./svg/bluetooth.svg#bluetooth" color={"7c7c7c"}></use>
          </svg>
          <svg className={`topbar__icon__phone topbar__icon__phone--${phoneState}`}>
            <use xlinkHref="./svg/phone.svg#phone"></use>
          </svg>
      </div>
      <div className="topbar__page">
      </div>
      <div className="topbar__time">
        <h2>{time.toLocaleTimeString('sv-SV', { hour: '2-digit', minute: '2-digit' })} </h2>
      </div>
    </div>

  );
};

export default TopBar;
