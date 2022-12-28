import React from "react";
import { useState, useEffect } from "react";
import "./topbar.scss";
import TopBarBackground from "./images/topbar.png";

const electron = window.require('electron');
const { ipcRenderer } = electron;

const TopBar = () => {

  //Get current Time

  const [time, setDate] = useState(new Date());
  const [wifiState, setWifiState] = useState("#7c7c7c");
  const [bluetoothState, setBluetoothState] = useState("#7c7c7c");
  const [phoneState, setPhoneState] = useState("#7c7c7c");

  
  const wifiOn = () => {
    setWifiState("#3f77a4");
  }

  const wifiOff = () => {
    setWifiState("#7c7c7c");
  }

  const plugged = () => {
    setPhoneState("#3f77a4");
  }

  const unplugged = () => {
    setPhoneState("#7c7c7c");
  }

  function updateTopBar() {
    setDate(new Date());
  }


  useEffect(() => {

    const timer1 = setInterval(updateTopBar, 10000);
    ipcRenderer.send('statusReq');
    ipcRenderer.send('updateWifi');

    ipcRenderer.on('wifi_on', wifiOn);

    ipcRenderer.on('wifi_off', wifiOff);
  
    ipcRenderer.on("plugged", plugged);
  
    ipcRenderer.on("unplugged", unplugged);

    return function cleanup() {
      clearInterval(timer1);

      ipcRenderer.removeListener('wifi_on',   wifiOn);
      ipcRenderer.removeListener('wifi_off',  wifiOff);
      ipcRenderer.removeListener('plugged',   plugged);
      ipcRenderer.removeListener('unplugged', unplugged);
      
    };
  }, []);

  return (
    <div className="topbar" style={{ backgroundImage: `url(${TopBarBackground})` }}>
      <div className="topbar__info">
        <svg className="topbar__icon">
          <use xlinkHref="./svg/wifi.svg#wifi" color={wifiState}></use>
        </svg>
        <svg className="topbar__icon">
          <use xlinkHref="./svg/bluetooth.svg#bluetooth" color={bluetoothState}></use>
        </svg>
        <svg className="topbar__icon">
          <use xlinkHref="./svg/phone.svg#phone" color={phoneState}></use>
        </svg>
      </div>
      <div className="topbar__page">
      </div>
      <div className="topbar__time">
        <h2 style={{ color: "#777777" }}>{time.toLocaleTimeString('sv-SV', { hour: '2-digit', minute: '2-digit' })} </h2>
      </div>
    </div>

  );
};

export default TopBar;
