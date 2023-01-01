import React from "react";
import Modal from "./modal/Modal";
import useModal from "./modal/useModal";

import { useState, useEffect } from "react";

import './settings.scss';
import '../../components/themes.scss';


const electron = window.require('electron');
const { ipcRenderer } = electron;


const Settings = ({ reqReload }) => {

  const Store = window.require('electron-store');
  const store = new Store();

  const [wifiList, setWifiList] = useState([{ id: "", ssid: 'No Networks available' }]);
  const [wifiStatus, setWifiStatus] = useState("");
  const [ssidSelected, setSsidSelected] = useState("127.0.0.1");

  const { isShowing, toggle } = useModal();

  //Handle Boost Gauge Checkbox
  const [theme, setTheme] = useState(store.get("colorTheme"));

  const colorSelect = (event) => {
    store.set('colorTheme', event.target.value);
    setTheme(store.get('colorTheme'));
    reloadApp();
  };

  //Handle Boost Gauge Checkbox
  const [toggleGaugeBoost, setGaugeBoost] = React.useState(store.get("showGaugeBoost"));

  const handleGaugeBoost = () => {
    store.set("showGaugeBoost", !toggleGaugeBoost);
    setGaugeBoost(!toggleGaugeBoost);
    console.log(store.get("showGaugeBoost"));
  };

  //Handle Intake Gauge Checkbox
  const [toggleGaugeIntake, setGaugeIntake] = React.useState(store.get("showGaugeIntake"));

  const handleGaugeIntake = () => {
    store.set("showGaugeIntake", !toggleGaugeIntake);
    setGaugeIntake(!toggleGaugeIntake);
    console.log(store.get("showGaugeIntake"));
  };

  //Handle Coolant Gauge Checkbox
  const [toggleGaugeCoolant, setGaugeCoolant] = React.useState(store.get("showGaugeCoolant"));

  const handleGaugeCoolant = () => {
    store.set("showGaugeCoolant", !toggleGaugeCoolant);
    setGaugeCoolant(!toggleGaugeCoolant);
    console.log(store.get("showGaugeCoolant"));
  };

  //Handle CruiseControl Checkbox
  const [toggleCruiseControl, setCruiseControl] = React.useState(store.get("activateCC"));

  const handleCruiseControl = () => {
    store.set("activateCC", !toggleCruiseControl);
    setCruiseControl(!toggleCruiseControl);
    console.log(store.get("activateCC"));
  };

  //Handle CAN Checkbox
  const [toggleCAN, setCAN] = React.useState(store.get("activateCAN"));

  const handleCAN = () => {
    store.set("activateCAN", !toggleCAN);
    setCAN(!toggleCAN);
    console.log(store.get("activateCAN"));
  };

  //Handle MMI Checkbox
  const [toggleMMI, setMMI] = React.useState(store.get("activateMMI"));

  const handleMMI = () => {
    store.set("activateMMI", !toggleMMI);
    setMMI(!toggleMMI);
    console.log(store.get("activateMMI"));
  };

  const updateWifi = (event, args) => {
    setWifiList(args);
  };

  const updateWifiStatus = (event, args) => {
    setWifiStatus(args);
  };

  function reloadApp() {
    ipcRenderer.send("reqReload");
  };

  function closeApp() {
    ipcRenderer.send("reqClose");
  };

  function clearDTC() {
    ipcRenderer.send("clearDTC");
  };

  function rebootRaspi() {
    ipcRenderer.send("reqReboot");
  };

  function openDialogue(ssid) {
    setSsidSelected(ssid);
    toggle();
  };

  function connectWifi(password) {
    var _credentials = {
      ssid: ssidSelected,
      password: password
    };

    ipcRenderer.send('connectWifi', _credentials);
  };

  function resetWifiStatus() {
    setWifiStatus("");
  };

  useEffect(() => {
    ipcRenderer.send('updateWifi');
    ipcRenderer.on('wifi_list', updateWifi);
    ipcRenderer.on('wifi_connected', updateWifiStatus);

    return function cleanup() {
      ipcRenderer.removeListener('wifi_list', updateWifi);
      ipcRenderer.removeListener('wifi_connected', updateWifiStatus);
    };
  }, []);

  return (
    <div className={`settings ${theme}`}>

      <Modal isShowing={isShowing}
        ssid={ssidSelected}
        hide={toggle}
        connect={connectWifi}
        status={wifiStatus}
        reset={resetWifiStatus}
      />

      <div className="settings__header">
        <h2>Settings</h2>
      </div>
      <div className="settings__body">
        <div className="settings__connections">
          <div className="settings__connections__wifi">
            <p><i>Available Wifi-Networks:</i></p>
            <div className="settings__connections__wifi__list">
              {wifiList.map((item, i) => (
                <div className="settings__connections__wifi__list__item" key={i}>
                  <button className="app-button" type="button" onClick={() => openDialogue(item.ssid)}>{item.ssid}</button>
                </div>
              ))}
            </div>
          </div>
          <div className="settings__connections__bt">
            <p><i>Volvo RTVI v1.2.0</i></p>
          </div>
        </div>
        <div className="settings__general">
          <div className="settings__general__section">
            <div className="settings__general__section__column">
              <h4>Choose a color theme:</h4>
            </div>
            <div className="settings__general__section__column">
              <label>
                <select className="app-button" color="Select a Color" onChange={colorSelect} defaultValue={store.get('colorTheme')}>
                  <option color="blue">  Blue  </option>
                  <option color="green"> Green </option>
                  <option color="red">   Red   </option>
                  <option color="white"> White </option>
                </select>
              </label>
            </div>
          </div>
          <div className="settings__general__section">
            <div className="settings__general__section__column">
              <div><h4>Gauges:</h4></div>
              <label><input type="checkbox" onChange={handleGaugeBoost} defaultChecked={store.get("showGaugeBoost")} /> Boost </label>
              <label><input type="checkbox" onChange={handleGaugeIntake} defaultChecked={store.get("showGaugeIntake")} /> Intake </label>
              <label><input type="checkbox" onChange={handleGaugeCoolant} defaultChecked={store.get("showGaugeCoolant")} /> Coolant </label>
            </div>
            <div className="settings__general__section__column">
              <div><h4>General:</h4></div>
              <label><input type="checkbox" onChange={handleCruiseControl} defaultChecked={store.get("activateCC")} /> Enable CC on IGN </label>
              <label><input type="checkbox" onChange={handleCAN} defaultChecked={store.get("activateCAN")} /> Enable CAN-Stream </label>
              <label><input type="checkbox" onChange={handleMMI} defaultChecked={store.get("activateMMI")} /> Enable MMI </label>
            </div >
          </div>
          <div className="settings__general__section">
            <div className="settings__general__section__column">
              <button className="app-button" type="button" onClick={reloadApp}>Relaunch Application</button>
              <button className="app-button" type="button" onClick={closeApp}>Close Application</button>
            </div>
            <div className="settings__general__section__column">
              <button className="app-button" type="button" onClick={clearDTC}>Clear 2-byte DTCs</button>
              <button className="app-button" type="button" onClick={rebootRaspi}>Reboot System</button>

            </div>
          </div>
        </div>
      </div>
    </div>


  )
};

export default Settings;
