import React from 'react';
import Modal from './modal/Modal';
import useModal from './modal/useModal';

import { useState, useEffect } from 'react';

import './settings.scss';
import '../../components/themes.scss';
//import 'UserSettings';

const electron = window.require('electron');
const { ipcRenderer } = electron;


const Settings = ({ settings, setSettings }) => {

  useEffect(() => {
    ipcRenderer.on('wifiList', updateWifi);
    ipcRenderer.on('wifiConnected', updateWifiStatus);
    ipcRenderer.send('wifiUpdate');

    return function cleanup() {
      ipcRenderer.removeListener('wifiList', updateWifi);
      ipcRenderer.removeListener('wifiConnected', updateWifiStatus);
    };
  }, []);

  const [wifiList, setWifiList] = useState([{ id: '', ssid: 'No Networks available' }]);
  const [wifiStatus, setWifiStatus] = useState('');
  const [ssidSelected, setSsidSelected] = useState('127.0.0.1');

  const { isShowing, toggle } = useModal();

  /* Color Theme */
  const colorSelect = (event) => {
    changeSetting('colorTheme', event.target.value);
    reloadApp();
  };

  /* Checkbox Boost */
  const [toggleGaugeBoost, setGaugeBoost] = React.useState(settings.showGaugeBoost);

  const handleGaugeBoost = () => {
    changeSetting('showGaugeBoost', !toggleGaugeBoost);
    setGaugeBoost(!toggleGaugeBoost);
  };

  /* Checkbox Intake */
  const [toggleGaugeIntake, setGaugeIntake] = React.useState(settings.showGaugeIntake);

  const handleGaugeIntake = () => {
    changeSetting('showGaugeIntake', !toggleGaugeIntake);
    setGaugeIntake(!toggleGaugeIntake);
  };

  /* Checkbox Coolant */
  const [toggleGaugeCoolant, setGaugeCoolant] = React.useState(settings.showGaugeCoolant);

  const handleGaugeCoolant = () => {
    changeSetting('showGaugeCoolant', !toggleGaugeCoolant);
    setGaugeCoolant(!toggleGaugeCoolant);
  };

  /* Checkbox CAN */
  const [toggleCAN, setCAN] = React.useState(settings.activateCAN);

  const handleCAN = () => {
    changeSetting('activateCAN', !toggleCAN);
    setCAN(!toggleCAN);
  };

  /* Checkbox MMI */
  const [toggleMMI, setMMI] = React.useState(settings.activateMMI);

  const handleMMI = () => {
    changeSetting('activateMMI', !toggleMMI);
    setMMI(!toggleMMI);
    reloadApp();
  };

  /* Checkbox UNDEFINED */
  //const [toggleCruiseControl, setCruiseControl] = React.useState(settings.activateCC);
  /*
  const handleCruiseControl = () => {
    changeSetting('activateCC', !toggleCruiseControl);
    setCruiseControl(!toggleCruiseControl);
  };
  */

  /* WiFi */
  function connectWifi(password) {
    var _credentials = {
      ssid: ssidSelected,
      password: password
    };

    console.log("Connecting with SSID: ", _credentials.ssid);
    ipcRenderer.send('wifiConnect', _credentials);
  };

  const updateWifi = (event, args) => {
    setWifiList(args);
  };

  const updateWifiStatus = (event, args) => {
    console.log(args);
    setWifiStatus(args);
  };

  function resetWifiStatus() {
    setWifiStatus('');
  };

  /* App */
  function reloadApp() {
    ipcRenderer.send('reqReload');
  };

  function closeApp() {
    ipcRenderer.send('reqClose');
  };

  function rebootRaspi() {
    ipcRenderer.send('reqReboot');
  };

  function openDialogue(ssid) {
    setSsidSelected(ssid);
    toggle();
  };

  /* Store settins */
  function changeSetting(setting, value) {
    ipcRenderer.send('settingsUpdate', { setting: setting, value: value });
    ipcRenderer.on('allSettings', (event, data) => { setSettings(data) });
  }

  return (
    <div className={`settings ${settings.theme}`}>

      <Modal isShowing={isShowing}
        ssid={ssidSelected}
        hide={toggle}
        
        status={wifiStatus}
        connect={connectWifi}
        reset={resetWifiStatus}
      />

      <div className='settings__header'>
        <h2>Settings</h2>
      </div>
      <div className='settings__body'>
        <div className='settings__connections'>
          <div className='settings__connections__wifi'>
            <h4>Available Wifi-Networks:</h4>
            <div className='settings__connections__wifi__list'>
              {wifiList.map((item, i) => (
                <div className='settings__connections__wifi__list__item' key={i}>
                  <button className='app-button' type='button' onClick={() => openDialogue(item.ssid)}>{item.ssid}</button>
                </div>
              ))}
            </div>
          </div>
          <div className='settings__connections__bt'>
            <p><i>Volvo RTVI v1.2.0</i></p>
          </div>
        </div>
        <div className='settings__general'>
          <div className='settings__general__section'>
            <div className='settings__general__section__column'>
              <h4>Choose a color theme:</h4>
            </div>
            <div className='settings__general__section__column'>
              <label>
                <select className='app-button' color='Select a Color' onChange={colorSelect} defaultValue={settings.colorTheme}>
                  <option color='blue'>  Blue  </option>
                  <option color='green'> Green </option>
                  <option color='red'>   Red   </option>
                  <option color='white'> White </option>
                </select>
              </label>
            </div>
          </div>
          <div className='settings__general__section'>
            <div className='settings__general__section__column'>
              <div><h4>Gauges:</h4></div>
              <label><input type='checkbox' onChange={handleGaugeBoost} defaultChecked={settings.showGaugeBoost} /> Boost </label>
              <label><input type='checkbox' onChange={handleGaugeIntake} defaultChecked={settings.showGaugeIntake} /> Intake </label>
              <label><input type='checkbox' onChange={handleGaugeCoolant} defaultChecked={settings.showGaugeCoolant} /> Coolant </label>
            </div>
            <div className='settings__general__section__column'>
              <div><h4>General:</h4></div>
              <label><input type='checkbox' onChange={handleCAN} defaultChecked={settings.activateCAN} /> Enable CAN </label>
              <label><input type='checkbox' onChange={handleMMI} defaultChecked={settings.activateMMI} /> Enable MMI </label>
              <label><input type='checkbox' defaultChecked={settings.activateCC} disabled={true} /> <span>-</span> </label>
            </div >
          </div>
          <hr
            style={{
              background: 'var(--fillInactive)',
              height: '1px',
              width: '90%',
              border: '0'
            }}
          />
          <div className='settings__general__system'>
            <div className='settings__general__section__column'>
              <button className='app-button' type='button' onClick={reloadApp}>Relaunch Application</button>
              <button className='app-button' type='button' onClick={closeApp}>Close Application</button>
            </div>
            <div className='settings__general__section__column'>
              <button className='app-button' type='button' onClick={rebootRaspi}>Reboot System</button>
              <button className='app-button' type='button' disabled={true}>-</button>
            </div>
          </div>
        </div>
      </div>
    </div>


  )
};

export default Settings;
