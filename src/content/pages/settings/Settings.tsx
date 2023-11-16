import React, { useState, useEffect } from 'react';
//import WifiModal from './modal/wifi/WifiModal';
import useModal from './modal/useModal';
import { io } from "socket.io-client";

import "./../../../themes.scss"
import "./../../../styles.scss"
import './settings.scss';

const settingsChannel = io("ws://localhost:4001/settings")
const ioChannel = io("ws://localhost:4001/io")

const Settings = ({ canbusSettings, applicationSettings, versionNumber }) => {

  // Wifi state variables
  const { wifiModalIsShowing, wifiModalToggle } = useModal();


  // Settings state variables
  const [newSettings, setNewSettings] = useState(structuredClone(applicationSettings));

  useEffect(() => {
    if (applicationSettings != null)
      setNewSettings(structuredClone(applicationSettings))
    console.log("app settings received in settings page:", applicationSettings)
  }, [applicationSettings]);


  /* Change Tabs */
  const [activeTab, setActiveTab] = useState(1);

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };


  /* Change Settings */
  const handleSettingChange = (key, name, newValue, newSettings) => {
    let update = structuredClone(newSettings);

    // Search for the key based on the label
    const convertedValue = Object.keys(canbusSettings.messages).find(
      (messageKey) => canbusSettings.messages[messageKey].label === newValue
    );

    if (key === 'carplay') {
      update[key][name] = newValue;
    } else {
      update[key][name].value = convertedValue || newValue;
    }

    setNewSettings(structuredClone(update));
  };


  /* Save Settings */
  function saveSettings() {
    settingsChannel.emit("saveSettings", "application", newSettings);
  }

  function openWifiModal() {
    wifiModalToggle();
  };


  /* I/O Functionality */
  function handleIO(request) {
    ioChannel.emit("performIO", request);
  }


  /* Render Settings */
  function renderSetting(key, handleSettingChange, settingsObj) {
    if (!settingsObj || !canbusSettings) return null;

    const { label, ...nestedObjects } = settingsObj[key];
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
        value = typeof nestedObj.value === 'number' || typeof nestedObj.value === 'boolean' || nestedKey === 'colorTheme' ? nestedObj.value : canbusSettings.messages[nestedObj.value].label;
        options = typeof value === 'number' || typeof value === 'boolean' ? null : nestedObj.options || Object.keys(canbusSettings.messages).map(messageKey => canbusSettings.messages[messageKey].label);
        isBoolean = typeof value === 'boolean'; isBoolean = typeof value === 'boolean';
      }


      const handleChange = (event) => {
        const { name, value, checked, type } = event.target;
        const newValue = type === 'checkbox' ? checked : type === 'number' ? Number(value) : value;

        if (isBoolean) {
          handleSettingChange(key, name, checked, settingsObj);
        } else {
          handleSettingChange(key, name, newValue, settingsObj);
        }
      };


      return (
        <div className='setting-elements__row' key={nestedKey}>
          <div className='setting-elements__row__item'>
            <span>{label}</span>
            <span className='setting-elements__row__divider'></span>
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
      <>
        {labelParagraph}
        {nestedElements}
      </>
    );
  }


  return (
    <>
      <div className='spacer' />
      <div className={`settings ${applicationSettings.app.colorTheme.value}`}>

        {/* 
        <WifiModal isShowing={wifiModalIsShowing}
          ssid={ssidSelected}
          hide={wifiModalToggle}
          settings={applicationSettings}
          status={wifiStatus}
          connect={connectWifi}
          reset={resetWifiStatus}
        />
        */}

        <div className='settings__header'>
          <h2>RTVI Settings</h2>
        </div>

        <div className='settings__body'>
          <div className='section'>
            <div className='section__1'>
              <div className='section__frame'>
                <div className='section__frame__row'>
                  <h3>Wireless Connections:</h3>
                </div>

                <div className='section__frame__content'>
                  <div className='scroller__container'>
                    <div className='scroller__container__content scrollbar-styles'>
                      Coming soon...
                    </div>
                  </div>
                </div>
              </div>

              <div className='section__frame'>
                <div className='section__frame__content'>
                  <div className='section__frame__row'>
                    <h3>I/O:</h3>
                  </div>

                  <div className='section__frame__row'>
                    <div className='section__frame__column'>
                      <button className='round-button button-styles button-background' type='button' onClick={() => {handleIO('reboot')}}>Reboot</button>
                      <button className='round-button button-styles button-background' type='button' onClick={() => {handleIO('restart')}}>Restart</button>
                    </div>


                    <div className='section__frame__column'>
                      <button className='round-button button-styles button-background' type='button' onClick={() => {handleIO('quit')}}>Quit</button>
                      <button className='round-button button-styles button-background' type='button' onClick={() => {handleIO('reset')}}>Reset</button>
                    </div>
                  </div>


                  <div className='section__frame__row'>
                    <h4><i>v{versionNumber}</i></h4>
                  </div>
                </div>
              </div>
            </div>

            <div className='section__2'>
              <div className='section__frame'>
                <div className='scroller__container'>
                  <div className="tab">
                    <button className={`square-button button-styles button-background ${activeTab === 1 ? 'active' : 'inactive'}`} type='button' onClick={() => handleTabChange(1)}> General </button>
                    <button className={`square-button button-styles button-background ${activeTab === 2 ? 'active' : 'inactive'}`} type='button' onClick={() => handleTabChange(2)}> Customization </button>
                    {/* <button className={`tab-button ${activeTab === 3 ? 'active' : 'inactive'}`} type='button' onClick={() => handleTabChange(3)}> Vehicle </button> */}
                    {applicationSettings.dev.advancedSettings.value ? <button className={`square-button button-styles button-background ${activeTab === 4 ? 'active' : 'inactive'}`} type='button' onClick={() => handleTabChange(4)}> Advanced </button> : <></>}
                  </div>

                  {activeTab === 1 &&
                    <div className='scroller__container__content scrollbar-styles'>
                      {renderSetting("app", handleSettingChange, newSettings)}
                      {renderSetting("interface", handleSettingChange, newSettings)}
                      {renderSetting("connections", handleSettingChange, newSettings)}
                      {renderSetting("dev", handleSettingChange, newSettings)}
                    </div>
                  }

                  {activeTab === 2 &&
                    <div className='scroller__container__content scrollbar-styles'>
                      {renderSetting("visibility", handleSettingChange, newSettings)}
                      {renderSetting("dash_bar", handleSettingChange, newSettings)}
                      {renderSetting("dash_1", handleSettingChange, newSettings)}
                      {renderSetting("dash_2", handleSettingChange, newSettings)}
                      {renderSetting("charts", handleSettingChange, newSettings)}
                    </div>
                  }

                  {activeTab === 3 &&
                    <div className='scroller__container__content scrollbar-styles'>
                      {renderSetting("comfort", handleSettingChange, newSettings)}
                      {renderSetting("lights", handleSettingChange, newSettings)}
                    </div>
                  }


                  {activeTab === 4 &&
                    <div className='scroller__container__content scrollbar-styles'>
                      {renderSetting("carplay", handleSettingChange, newSettings)}
                    </div>
                  }
                </div>

                <div className='section__frame__row'>
                  <button className='round-button button-styles button-background' type='button' onClick={saveSettings}>Save</button>
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
