import React, { useState, useEffect } from 'react';
//import WifiModal from './modal/wifi/WifiModal';
import useModal from './modal/useModal';
import { io } from "socket.io-client";

import "./../../../themes.scss"
import "./../../../styles.scss"
import './settings.scss';

const settingsChannel = io("ws://localhost:4001/settings")
const canbusChannel = io("ws://localhost:4001/canbus")
const adcChannel = io("ws://localhost:4001/adc")
const systemChannel = io("ws://localhost:4001/system")

const Settings = ({ canState, adcState, sensorSettings, applicationSettings, versionNumber }) => {

  // Wifi state variables
  const { wifiModalIsShowing, wifiModalToggle } = useModal();


  // Settings state variables
  const [newSettings, setNewSettings] = useState(structuredClone(applicationSettings));


  useEffect(() => {
    if (applicationSettings != null)
      setNewSettings(structuredClone(applicationSettings))
  }, [applicationSettings]);


  /* Change Tabs */
  const [activeTab, setActiveTab] = useState(1);

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  /* Add Settings */
  const handleAddSetting = (key, currentSettings) => {
    if (currentSettings.constants.chart_input_current < currentSettings.constants.chart_input_max) {
      const newSetting = {
        value: "rpm",
        label: `Value ${currentSettings.constants.chart_input_current + 1}`,
      };
  
      // Check if the key exists in the settings
      if (currentSettings[key]) {
        // Create a copy of the current settings for the key
        const updatedSettingsForKey = {...currentSettings[key]};
  
        // Generate a unique ID for the new setting
        const newSettingId = `value_${currentSettings.constants.chart_input_current + 1}`;
        
        // Add the new setting to the copied settings
        updatedSettingsForKey[newSettingId] = newSetting;
  
        // Update the state with the new settings
        setNewSettings({
          ...currentSettings,
          constants: {
            ...currentSettings.constants,
            chart_input_current: currentSettings.constants.chart_input_current + 1,
          },
          [key]: updatedSettingsForKey,
        });
      } else {
        console.error(`Key "${key}" not found in settings.`);
      }
    }
  };

  /* Remove Settings */
  const handleRemoveSetting = (key, currentSettings) => {
    if (currentSettings.constants.chart_input_current > 1) {
      // Create a copy of the current settings for the key
      const updatedSettingsForKey = {...currentSettings[key]};
  
      // Identify the setting to remove (assuming the last one added)
      const settingIdToRemove = `value_${currentSettings.constants.chart_input_current}`;
  
      // Remove the identified setting
      delete updatedSettingsForKey[settingIdToRemove];
  
      // Update the state with the settings minus the removed one
      setNewSettings({
        ...currentSettings,
        constants: {
          ...currentSettings.constants,
          chart_input_current: currentSettings.constants.chart_input_current - 1,
        },
        [key]: updatedSettingsForKey,
      });
    } else {
      console.error("Cannot remove setting, minimum limit reached.");
    }
  };
  

  /* Change Settings */
  const handleSettingChange = (key, name, newValue, newSettings) => {
    let update = structuredClone(newSettings);

    // Search for the key based on the label
    const convertedValue = Object.keys(sensorSettings).find(
      (messageKey) => sensorSettings[messageKey].label === newValue
    );

    if (key === 'carplay' || key === 'constants') {
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
  function systemTask(request) {
    systemChannel.emit("systemTask", request);
  }

  /* I/O Functionality */
  function handleCAN() {
    canbusChannel.emit("toggle");
    canbusChannel.emit("requestStatus");
  }

  /* I/O Functionality */
  function handleADC() {
    adcChannel.emit("toggle");
    adcChannel.emit("requestStatus");
  }

  /* Render Settings */
  function renderSetting(key, settingsObj) {
    if (!settingsObj || !sensorSettings) return null;

    const { label, ...nestedObjects } = settingsObj[key];
    const labelParagraph = <h3>{label}</h3>;

    const nestedElements = Object.entries(nestedObjects).map(([nestedKey, nestedObj]) => {
      if (nestedKey === "label") return null;
      let label, value, options, isBoolean;

      if (key != "constants") {
        if (key === "carplay") {
          label = nestedKey;
          value = nestedObj;
          options = null;
          isBoolean = typeof nestedObj === 'boolean';
        } else {
          label = nestedObj.label;
          value = typeof nestedObj.value === 'number' || typeof nestedObj.value === 'boolean' || nestedKey === 'colorTheme' || nestedKey === 'defaultDash' || nestedKey === 'startPage' ? nestedObj.value : sensorSettings[nestedObj.value].label;
          options = typeof value === 'number' || typeof value === 'boolean' ? null : nestedObj.options || Object.keys(sensorSettings).map(messageKey => sensorSettings[messageKey].label);
          isBoolean = typeof value === 'boolean'; isBoolean = typeof value === 'boolean';
        }
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

        <div className='settings__body'>

          <div className='section'>
            <div className='section__1'>
              <div className='settings__header'>
                <h2>RTVI Settings</h2>
              </div>
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
                      <button className='round-button button-styles button-background' type='button' onClick={() => { systemTask('reboot') }}>Reboot</button>
                      <button className='round-button button-styles button-background' type='button' onClick={() => { systemTask('restart') }}>Restart</button>
                    </div>


                    <div className='section__frame__column'>
                      <button className='round-button button-styles button-background' type='button' onClick={() => { systemTask('quit') }}>Quit</button>
                      <button className='round-button button-styles button-background' type='button' onClick={() => { systemTask('reset') }}>Reset</button>
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
                    {applicationSettings.dev.advancedSettings.value ? <button className={`square-button button-styles button-background ${activeTab === 0 ? 'active' : 'inactive'}`} type='button' onClick={() => handleTabChange(0)}> Advanced </button> : <></>}
                  </div>

                  {activeTab === 1 &&
                    <div className='scroller__container__content scrollbar-styles'>

                      {renderSetting("app", newSettings)}
                      {renderSetting("connections", newSettings)}

                      <div className='setting-elements__row'>
                        <div className='setting-elements__row__item'>
                          <span>CAN Worker {canState ? "(Inactive)" : "(Active)"}</span>
                          <span className='setting-elements__row__divider'></span>
                          <span>
                            <button className='round-button button-styles button-background' type='button' onClick={() => { handleCAN() }}>{canState ? "On" : "Off"}</button>
                          </span>
                        </div>
                      </div>

                      <div className='setting-elements__row'>
                        <div className='setting-elements__row__item'>
                          <span>ADC Worker {adcState ? "(Inactive)" : "(Active)"}</span>
                          <span className='setting-elements__row__divider'></span>
                          <span>
                            <button className='round-button button-styles button-background' type='button' onClick={() => { handleADC() }}>{adcState ? "On" : "Off"}</button>
                          </span>
                        </div>
                      </div>

                      {renderSetting("dev", newSettings)}
                    </div>
                  }

                  {activeTab === 2 &&
                    <div className='scroller__container__content scrollbar-styles'>
                      {/*renderSetting("visibility", newSettings)*/}
                      {renderSetting("dash_bar", newSettings)}
                      {renderSetting("dash_1", newSettings)}
                      {renderSetting("charts", newSettings)}
                      <div className='setting-elements__row'>
                        <div className='setting-elements__row__item'>
                          <span>Add/Remove Data</span>
                          <span className='setting-elements__row__divider'></span>
                          <div style={{display: "flex", flexDirection: "row", gap: "5px"}}>
                            <button className='round-button button-styles button-background' type='button' onClick={() => { handleAddSetting("charts", newSettings) }}>+</button>
                            <button className='round-button button-styles button-background' type='button' onClick={() => { handleRemoveSetting("charts", newSettings) }}>-</button>
                          </div>
                        </div>
                      </div>
                      {renderSetting("dash_3", newSettings)}
                      {/*renderSetting("racedash", handleSettingChange, newSettings)*/}

                    </div>
                  }

                  {activeTab === 3 &&
                    <div className='scroller__container__content scrollbar-styles'>
                      {renderSetting("comfort", newSettings)}
                      {renderSetting("lights", newSettings)}
                    </div>
                  }


                  {activeTab === 0 &&
                    <div className='scroller__container__content scrollbar-styles'>
                      {renderSetting("carplay", newSettings)}
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
