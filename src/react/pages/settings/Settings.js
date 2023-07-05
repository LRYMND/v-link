import React, { useState, useEffect } from 'react';
import WifiModal from './modal/wifi/WifiModal';
import CarplayModal from './modal/carplay/CarplayModal';
import useModal from './modal/useModal';

import "../../themes.scss";
import './settings.scss';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const Settings = ({ settings, setSettings, allSettings }) => {

  console.log("#1", allSettings)
  console.log("#2", allSettings.activateCAN)
  console.log("#3", allSettings.app.properties)
  console.log("#4", allSettings.app.properties.colorTheme.properties)
  console.log("#5", allSettings.app.properties.colorTheme.properties.options)
  console.log("#6", allSettings.app.properties.colorTheme.properties.options[1])
  console.log("#7", allSettings.app.properties.colorTheme.properties.value.default);
  console.log("#8", allSettings.app.properties.colorTheme.properties.label.default);



  const [wifiList, setWifiList] = useState([{ id: '', ssid: 'No Networks available' }]);
  const [wifiStatus, setWifiStatus] = useState('');
  const [ssidSelected, setSsidSelected] = useState('127.0.0.1');
  const [theme, setTheme] = useState(settings.colorTheme);

  const { carplayModalIsShowing, carplayModalToggle } = useModal();
  const { wifiModalIsShowing, wifiModalToggle } = useModal();

  useEffect(() => {
    ipcRenderer.on('allSettings', (event, data) => { setSettings(data) });
    ipcRenderer.on('wifiList', updateWifi);
    ipcRenderer.on('wifiConnected', updateWifiStatus);

    return function cleanup() {
      ipcRenderer.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    ipcRenderer.send('wifiUpdate');
  }, []);

  useEffect(() => {
    if (theme !== null)
      ipcRenderer.send('settingsUpdate', { setting: 'colorTheme', value: theme });
  }, [theme]);






  function renderSetting(key) {
    const { label, ...nestedObjects } = allSettings[key].properties;

    const labelParagraph = <h3>{label.default}</h3>;

    const nestedElements = Object.entries(nestedObjects).map(([nestedKey, nestedObj]) => {
      if (nestedKey === "label") return null;

      const { label, value, options } = nestedObj.properties;
      const isBoolean = typeof value.default === 'boolean';

      return (
        <div className='setting'>
          <div className='setting__element' key={nestedKey}>
            <span>{label.default}</span>
            <span className='setting__divider'></span>
            <span>
              {options ? (
                <select className='dropdown' name={nestedKey} defaultValue={value.default} onChange={console.log("Hello")}>
                  {options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : (
                isBoolean ? (
                  <label className='toggle'>
                    <input type='checkbox' name={nestedKey} defaultChecked={value.default} onChange={console.log("Hello")} />
                    <span className='toggle__slider'></span>
                  </label>
                ) : (
                  <input className='input' type='number' name={nestedKey} defaultValue={value.default} onChange={console.log("Hello")} />
                )
              )}
            </span>
          </div>
        </div>
      );
    });

    return (
      <div>
        {labelParagraph}
        {nestedElements}
      </div>
    );
  }


  <div className='volvo__container__section__element'>
    <span>Enable Haldex</span>

    <span className='volvo__container__section__divider'></span>

    <span>
      <input type='checkbox' onChange={console.log('Checked')} defaultChecked={false} />
    </span>
  </div>







  const [activeTab, setActiveTab] = useState(1);

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };






  /* Color Theme */
  const colorSelect = (event) => {
    console.log('new theme: ', event.target.value)
    setTheme(event.target.value)
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
    reloadApp();
  };

  /* Checkbox MMI */
  const [toggleMMI, setMMI] = React.useState(settings.activateMMI);

  const handleMMI = () => {
    changeSetting('activateMMI', !toggleMMI);
    setMMI(!toggleMMI);
    reloadApp();
  };

  /* Checkbox OSD */
  const [toggleOSD, setOSD] = React.useState(settings.activateOSD);

  const handleOSD = () => {
    changeSetting('activateOSD', !toggleOSD);
    setOSD(!toggleOSD);

    if (toggleOSD) {
      changeSetting('height', settings.windowHeight);
    } else {
      changeSetting('height', settings.windowHeight - 40);
    }
    reloadApp();
  };

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

  /* Control Modals */
  function openCarplayModal() {
    carplayModalToggle();
  };

  function openWifiModal(ssid) {
    setSsidSelected(ssid);
    wifiModalToggle();
  };

  /* Store settings */
  function changeSetting(setting, value) {
    ipcRenderer.send('settingsUpdate', { setting: setting, value: value });
  }

  return (
    <div className={`settings ${settings.colorTheme}`}>

      <CarplayModal isShowing={carplayModalIsShowing}
        hide={carplayModalToggle}
        settings={settings}
        changeSetting={changeSetting}
      />

      <WifiModal isShowing={wifiModalIsShowing}
        ssid={ssidSelected}
        hide={wifiModalToggle}
        settings={settings}
        status={wifiStatus}
        connect={connectWifi}
        reset={resetWifiStatus}
      />

      <div className='settings__header'>
        <h2>RTVI Settings</h2>
      </div>
      <div className='settings__body'>
        <div className='settings__connections'>
          <div className='settings__connections__wifi'>
            <h4>Available Wifi-Networks:</h4>
            <div className='settings__connections__wifi__list'>
              {wifiList.map((item, i) => (
                <div className='settings__connections__wifi__list__item' key={i}>
                  <button className='app-button' type='button' onClick={() => openWifiModal(item.ssid)}>{item.ssid}</button>
                </div>
              ))}
            </div>
          </div>
          <div className='settings__connections__bt'>
            <p><i>RTVI v1.2.4</i></p>
          </div>
        </div>
        <div className='settings__general'>
          <div className='settings__general__application'>
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
                <label><input type='checkbox' onChange={handleOSD} defaultChecked={settings.activateOSD} /> Enable OSD </label>
              </div >
            </div>

            <div className="tab">
                    <button className='app-button' active type='button' onClick={() => handleTabChange(1)}>Application</button>
                    <button className='app-button' type='button' onClick={() => handleTabChange(2)}>Customization</button>
            </div>

            <div className='settings__general__section'>
              {activeTab === 1 &&
                  <div>
                    {renderSetting("app")}
                    {renderSetting("interface")}
                  </div>
              }

              {activeTab === 2 &&
                  <div>
                  {renderSetting("dash_bar")}
                  {renderSetting("dash_1")}
                  {renderSetting("dash_2")}
                  {renderSetting("visibility")}
                  </div>
              }

            </div>
          </div>

          <div className='settings__general__system'>
            <div className='settings__general__section__column'>
              <button className='app-button' type='button' onClick={reloadApp}>Relaunch Application</button>
              <button className='app-button' type='button' onClick={closeApp}>Close Application</button>
            </div>
            <div className='settings__general__section__column'>
              <button className='app-button' type='button' onClick={rebootRaspi}>Reboot System</button>
              <button className='app-button' type='button' onClick={openCarplayModal}>Advanced Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>


  )
};

export default Settings;
