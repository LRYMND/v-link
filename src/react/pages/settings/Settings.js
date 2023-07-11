import React, { useState, useEffect } from 'react';
import WifiModal from './modal/wifi/WifiModal';
import useModal from './modal/useModal';

import "../../themes.scss";
import './settings.scss';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const Settings = ({ settings, setSettings, allSettings, setAllSettings, versionNumber }) => {

  const [wifiList, setWifiList] = useState([{ id: '', ssid: 'No Networks available' }]);
  const [wifiStatus, setWifiStatus] = useState('');
  const [ssidSelected, setSsidSelected] = useState('127.0.0.1');

  const { wifiModalIsShowing, wifiModalToggle } = useModal();

  const [newSettings, setNewSettings] = useState(JSON.parse(JSON.stringify(allSettings)));

  useEffect(() => {
    ipcRenderer.on('allSettings', (event, data) => { setSettings(data) });
    ipcRenderer.on('wifiList', updateWifi);
    ipcRenderer.on('wifiConnected', updateWifiStatus);

    return function cleanup() {
      setNewSettings(allSettings);
      console.log("allSettings:", allSettings.app.colorTheme.value)
      ipcRenderer.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    ipcRenderer.send('wifiUpdate');
  }, []);


  /* Change Tabs */
  const [activeTab, setActiveTab] = useState(1);

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };


  /* Change Settings */
  const handleSettingChange = (key, name, newValue, newSettings) => {

    let update = { ...newSettings };
    update[key][name].value = newValue;

    setNewSettings(update);
  };


  /* Save Settings */
  function saveSettings() {
    ipcRenderer.send('saveSettings', newSettings);
    setAllSettings(newSettings)
    console.log('Settings have been saved.');
  };


  /* Render Settings */
  function renderSetting(key, handleSettingChange, newSettings) {

    if (!newSettings) return null;
    const { label, ...nestedObjects } = newSettings[key];
    const labelParagraph = <h3>{label}</h3>;

    const nestedElements = Object.entries(nestedObjects).map(([nestedKey, nestedObj]) => {
      if (nestedKey === "label") return null;
      let label, value, options, isBoolean;

      if (key === "carplay") {
        label = nestedKey;
        value = nestedObj;
        options = null;
        isBoolean = typeof nestedObj === 'boolean';
      } else {
        label = nestedObj.label;
        value = nestedObj.value;
        options = nestedObj.options;
        isBoolean = typeof value === 'boolean';
      }

      const handleChange = (event) => {
        const { name, value, checked, type } = event.target;
        const newValue = type === 'checkbox' ? checked : type === 'number' ? Number(value) : value;

        if (isBoolean) {
          handleSettingChange(key, name, checked, newSettings);
        } else {
          handleSettingChange(key, name, newValue, newSettings);
        }
      };

      return (
        <div className='setting__row' key={nestedKey}>
          <div className='setting__row__element'>
            <span>{label}</span>
            <span className='setting__row__divider'></span>
            <span>
              {options ? (
                <select className='dropdown' name={nestedKey} value={value} onChange={handleChange}>
                  {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                isBoolean ? (
                  <label className='toggle'>
                    <input type='checkbox' name={nestedKey} checked={value} onChange={handleChange} />
                    <span className='toggle__slider'></span>
                  </label>
                ) : (
                  <input className='input' type='number' name={nestedKey} value={value} onChange={handleChange} />
                )
              )}
            </span>
          </div>
        </div>
      );
    });

    return (
      <div className='setting'>
        {labelParagraph}
        {nestedElements}
      </div>
    );
  }


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


  function openWifiModal(ssid) {
    setSsidSelected(ssid);
    wifiModalToggle();
  };


  /* I/O */
  function handleIO(request) {
    return function () {
      ipcRenderer.send(request);
    };
  }


  return (
    <>
      <div className='spacer' />
      <div className={`settings ${allSettings.app.colorTheme.value}`}>

        <WifiModal isShowing={wifiModalIsShowing}
          ssid={ssidSelected}
          hide={wifiModalToggle}
          settings={allSettings}
          status={wifiStatus}
          connect={connectWifi}
          reset={resetWifiStatus}
        />


        <div className='settings__header'>
          <h2>RTVI Settings</h2>
        </div>
        <div className='settings__body'>

          <div className='section'>

            <div className='section__1'>
              <div className='section__frame'>
                <div className='section__frame__banner'>
                  <h3>WiFi Networks:</h3>
                </div>

                <div className='section__frame__content'>


                  <div className='scroller__container'>
                    <div className='scroller__container__content'>
                      <div className='list'>
                        {wifiList.map((item, i) => (
                          <div className='list__content' key={i}>
                            <button className='app-button' type='button' onClick={() => openWifiModal(item.ssid)}>{item.ssid}</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='section__frame'>

                <div className='section__frame__banner'>
                  <h3>I/O:</h3>
                </div>

                <div className='section__frame__content'>
                  <div className='section__frame__content__column'>
                    <button className='app-button' type='button' onClick={handleIO('reqReboot')}>Reboot</button>
                    <button className='app-button' type='button' onClick={handleIO('reqClose')}>Quit</button>
                  </div>
                  <div className='section__frame__content__column'>
                    <button className='app-button' type='button' onClick={handleIO('reqReload')}>Restart</button>

                  </div>
                </div>

                <div className='section__frame__banner'>
                  <h4><i>v{versionNumber}</i></h4>
                </div>
              </div>
            </div>


            <div className='section__2'>
              <div className='section__frame'>
                <div className='scroller__container'>
                  <div className="tab">
                    <button className='tab-button' active type='button' onClick={() => handleTabChange(1)}>Application</button>
                    <button className='tab-button' type='button' onClick={() => handleTabChange(2)}>Customization</button>
                    <button className='tab-button' type='button' onClick={() => handleTabChange(3)}>Advanced</button>
                  </div>


                  {activeTab === 1 &&
                    <div className='scroller__container__content'>
                      {renderSetting("app", handleSettingChange, newSettings)}
                      {renderSetting("interface", handleSettingChange, newSettings)}
                    </div>
                  }

                  {activeTab === 2 &&
                    <div className='scroller__container__content'>
                      {renderSetting("dash_bar", handleSettingChange, newSettings)}
                      {renderSetting("dash_1", handleSettingChange, newSettings)}
                      {renderSetting("dash_2", handleSettingChange, newSettings)}
                      {renderSetting("visibility", handleSettingChange, newSettings)}
                    </div>
                  }

                  {activeTab === 3 &&
                    <div className='scroller__container__content'>
                      {renderSetting("carplay", handleSettingChange, newSettings)}
                    </div>
                  }
                </div>

                <div className='section__frame__banner'>
                  <button className='app-button' type='button' onClick={saveSettings}>Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='spacer' />
    </>

  )
};

export default Settings;
