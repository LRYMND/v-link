import React from "react";
import { useState, useEffect } from "react";

//import Modal from "../../components/Modal";

import './settings.scss';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const Settings = ({ reqReload }) => {

  const [wifiList, setWifiList] = useState([{ id: "", ssid: 'No Networks available' }]);
  const [wifi, setWifi] = useState('Hello');
  //const [showModal, setShowModal] = useState(false);

  const updateWifi = (event, args) => {
    setWifiList(args);
  };

  function reloadApp() {
    ipcRenderer.send("reqReload");
  };

  function closeApp() {
    ipcRenderer.send("reqClose");
  };

  function connectWifi(ssid) {
    //setWifi(ssid);
    //setShowModal(true);
    console.log("connecting to: ", ssid)
  };

  useEffect(() => {
    ipcRenderer.send('updateWifi');
    ipcRenderer.on('wifi_list', updateWifi);

    return function cleanup() {
      ipcRenderer.removeListener('wifi_list', updateWifi);
    };
  }, []);

  return (
    <div className="settings">
      <div className="settings__title">
        <h2> </h2>
      </div>
      <div className="settings__body">
        <div className="settings__connections">
          <div className="settings__connections__wifi">
            {wifiList.map((item, i) => (
              <div className="settings__connections__wifi__item" key={i}><button className="selectNetworkButton" type="button" onClick={() => connectWifi(item.ssid)}>{item.ssid}</button></div>
            ))}
          </div>
          <div className="settings__connections__bt">
          </div>
        </div>
        <div className="settings__modules">
        </div>
      </div>
      <div className="settings__app">
        <button className="relaunchButton" type="button" onClick={reloadApp}>Relaunch Application</button>
        <button className="closeButton" type="button" onClick={closeApp}>Close Application</button>
      </div>
    </div>

  )
};

export default Settings;
