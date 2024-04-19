import { useState } from 'react';
import { ApplicationSettings, SensorSettings, Store } from '../../../store/Store';

import { io } from "socket.io-client";

import SimpleButton from '../../components/SimpleButton'
import SimpleInput from '../../components/SimpleInput'
import SimpleSelect from '../../components/SimpleSelect'
import SimpleLabel from '../../components/SimpleLabel'
import SimpleCheckbox from '../../components/SimpleCheckbox'

import "./../../../themes.scss"
import "./../../../styles.scss"

const settingsChannel = io("ws://localhost:4001/settings")
const canChannel = io("ws://localhost:4001/canbus")
const adcChannel = io("ws://localhost:4001/adc")
const systemChannel = io("ws://localhost:4001/system")

const Settings = () => {
  const applicationSettings = ApplicationSettings((state) => state.applicationSettings);
  const sensorSettings = SensorSettings((state) => state.sensorSettings);
  const store = Store((state) => state);

  const updateApplicationSettings = ApplicationSettings((state) => state.updateApplicationSettings);

  const [currentSettings, setCurrentSettings] = useState(structuredClone(applicationSettings));
  const [activeTab, setActiveTab] = useState(1);

  /* Switch Tabs */
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
        const updatedSettingsForKey = { ...currentSettings[key] };
        const newSettingId = `value_${currentSettings.constants.chart_input_current + 1}`;
        updatedSettingsForKey[newSettingId] = newSetting;

        // Update the state with the new settings
        setCurrentSettings({
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
      const updatedSettingsForKey = { ...currentSettings[key] };
      const settingIdToRemove = `value_${currentSettings.constants.chart_input_current}`;
      delete updatedSettingsForKey[settingIdToRemove];

      // Update the state with the  minus the removed one
      setCurrentSettings({
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
  const handleSettingChange = (key, name, newValue, currentSettings) => {
    const newSettings = structuredClone(currentSettings);
    const convertedValue = Object.keys(sensorSettings).find(
      (messageKey) => sensorSettings[messageKey].label === newValue
    );

    if (key === 'carplay' || key === 'constants') {
      newSettings[key][name] = newValue;
    } else {
      newSettings[key][name].value = convertedValue || newValue;
    }

    setCurrentSettings(newSettings);
  };

  /* Save Settings */
  function saveSettings() {
    updateApplicationSettings(currentSettings);
    settingsChannel.emit("saveSettings", "application", currentSettings);
  }



  /* I/O Functionality */
  function systemTask(request) {
    systemChannel.emit("systemTask", request);
  }

  function handleIO(channel) {
    channel.emit("toggle");
    channel.emit("requestStatus");
  }

  /* Render Settings */
  function renderSetting(key, settingsObj) {
    if (!settingsObj || !sensorSettings) return null;

    const { label, ...nestedObjects } = settingsObj[key];
    const labelParagraph = label

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
          value = typeof nestedObj.value === 'number' || typeof nestedObj.value === 'boolean' || nestedKey === 'colorTheme' || nestedKey === 'defaultDash' || nestedKey === 'startPage' || nestedKey === 'textSize' ? nestedObj.value : sensorSettings[nestedObj.value].label;
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
        <div className='list row' key={nestedKey}>
          <SimpleLabel
            textColor={'var(--textColorDefault)'}
            text={label}
            textSize={2.2}
            textScale={store.textScale}
          />

          <span className='divider'></span>
          <div className='column' style={{ flex: '0 0 40%', justifyContent: 'center', alignItems: 'center' }}>
            {options ? (
              <SimpleSelect
                name={nestedKey}
                value={value}
                options={options}
                onChange={handleChange}
                textSize={2.2}
                textScale={store.textScale}
                textColor={'var(--textColorDefault)'}
                isActive={true}
              />
            ) : (
              isBoolean ? (
                <SimpleCheckbox
                  name={nestedKey}
                  checked={value}
                  onChange={handleChange}
                  colorActive={'var(--themeDefault)'}
                  colorInactive={'var(--boxColorDark)'}
                  borderColor={'var(--boxColorDarker)'}
                  isActive={true}
                />
              ) : (
                <SimpleInput
                  type='number'
                  name={nestedKey}
                  value={value}
                  onChange={handleChange}
                  textSize={2.2}
                  textScale={store.textScale}
                  textColor={'var(--textColorDefault)'}
                  isActive={true}
                />
              )
            )}
          </div>
        </div>
      );
    });

    return (
      <>
        <SimpleLabel
          textColor={'var(--textColorLight)'}
          text={<h3> {labelParagraph} </h3>}
          textSize={2.2}
          textScale={store.textScale}
        />
        {nestedElements}
      </>
    );
  }

  const clickTest = () => {
    console.log('Click :)');
  };


  return (
    <>
      <div className={`settings ${applicationSettings.app.colorTheme.value}`} style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>

        <div className='column' style={{ padding: '0px', height: '90%', justifyContent: 'space-around' }}>
          <div className='row' style={{ height: '90%' }}>
            <div className='column' style={{ gap: '20px' }}>
              <div className='row' style={{ height: '10%' }}>
                <h1>SETTINGS</h1>
              </div>
              <div className='frame'>
                <div className='column'>
                  <div className='row'>
                    <SimpleLabel
                      textColor={'var(--textColorLight)'}
                      text={<h3> Wireless Connections: </h3>}
                      textSize={2.2}
                      textScale={store.textScale}
                    />
                  </div>

                  <div className='row' style={{ marginBottom: '10%' }}>
                    <div className='column'>
                      <SimpleButton
                        text={"Coming Soon"}
                        textSize={2.2}
                        textScale={store.textScale}
                        textColor={'var(--textColorDefault)'}
                        isActive={false}
                        onClick={clickTest}
                        backgroundColor={'var(--boxColorDark)'}
                      />
                    </div>
                  </div>
                </div>
              </div>


              <div className='frame'>
                <div className='column' style={{ gap: '0px', width: '100%', height: '90%', justifyContent: 'center' }}>
                  <div className='row'>
                    <SimpleLabel
                      textColor={'var(--textColorLight)'}
                      text={<h3> I/O: </h3>}
                      textSize={2.2}
                      textScale={store.textScale}
                    />
                  </div>

                  <div className='row' style={{ height: '50%', justifyContent: 'center' }}>
                    <div className='column' style={{ gap: '10%' }}>
                      <SimpleButton
                        text={"Reboot"}
                        textSize={2.2}
                        textScale={store.textScale}
                        textColor={'var(--textColorDefault)'}
                        isActive={true}
                        onClick={() => { systemTask('reboot') }}
                        backgroundColor={'var(--boxColorDark)'}
                      />
                      <SimpleButton
                        text={"Restart"}
                        textSize={2.2}
                        textScale={store.textScale}
                        textColor={'var(--textColorDefault)'}
                        isActive={true}
                        onClick={() => { systemTask('restart') }}
                        backgroundColor={'var(--boxColorDark)'}
                      />
                    </div>

                    <div className='column' style={{ gap: '10%' }}>
                      <SimpleButton
                        text={"Quit"}
                        textSize={2.2}
                        textScale={store.textScale}
                        textColor={'var(--textColorDefault)'}
                        isActive={true}
                        onClick={() => { systemTask('quit') }}
                        backgroundColor={'var(--boxColorDark)'}
                      />
                      <SimpleButton
                        text={"Reset"}
                        textSize={2.2}
                        textScale={store.textScale}
                        textColor={'var(--textColorDefault)'}
                        isActive={true}
                        onClick={() => { systemTask('reset') }}
                        backgroundColor={'var(--boxColorDark)'}
                      />
                    </div>
                  </div>

                  <div className='row'>
                    <label><i>v{store.version}</i></label>
                  </div>
                </div>
              </div>
            </div>
            <div className='column' style={{ flex: '0 1 70%', gap: '10px' }}>
              <div className='frame'>
                <div className='row' style={{ height: '20%', justifyContent: 'flex-start', paddingTop: '2vh' }}>
                  <div className="scroller__tab">
                    <SimpleButton
                      height={'100%'}
                      text={<b>GENERAL</b>}
                      textSize={2.5}
                      textScale={store.textScale}
                      textColor={activeTab === 1 ? 'var(--textColorLight)' : 'var(--textColorDark)'}
                      isActive={true}
                      backgroundColor={activeTab === 1 ? 'var(--boxColorDark)' : 'var(--boxColorDarker)'}
                      onClick={() => handleTabChange(1)}
                    />

                    <SimpleButton
                      height={'100%'}
                      text={<b>CUSTOMIZATION</b>}
                      textSize={2.5}
                      textScale={store.textScale}
                      textColor={activeTab === 2 ? 'var(--textColorLight)' : 'var(--textColorDark)'}
                      isActive={true}
                      backgroundColor={activeTab === 2 ? 'var(--boxColorDark)' : 'var(--boxColorDarker)'}
                      onClick={() => handleTabChange(2)}
                    />
                  </div>
                </div>

                <div className='row' style={{ height: '70%' }}>
                  <div className='frame' style={{ margin: '10px', height: '100%', backgroundColor: 'var(--boxColorDark)' }}>
                    <div className='column' style={{ height: '80%', justifyContent: 'center' }}>

                      <div className='scroller  scrollbar-styles' style={{ height: '90%', width: '90%', justifyContent: 'flex-start' }}>

                        {activeTab === 1 &&
                          <>
                            {renderSetting("app", currentSettings)}
                            {renderSetting("side_bars", currentSettings)}
                            <div className='list row'>
                              <SimpleLabel
                                textColor={'var(--textColorDefault)'}
                                text={`CAN ${store.canState ? '(Inactive)' : '(Active)'}`}
                                textSize={2.2}
                                textScale={store.textScale}
                              />
                              <span className='divider'></span>
                              <div className='row' style={{ flex: '0 0 40%', marginRight: '10px', height: '5vh' }}>
                                <SimpleButton
                                  text={store.canState ? "On" : "Off"}
                                  textSize={2.2}
                                  textScale={store.textScale}
                                  textColor={'var(--textColorDefault)'}
                                  isActive={true}
                                  onClick={() => { handleIO(canChannel) }}
                                  backgroundColor={'var(--boxColorDarker)'}
                                />
                              </div>
                            </div>

                            <div className='list row'>
                              <SimpleLabel
                                textColor={'var(--textColorDefault)'}
                                text={`ADC ${store.adcState ? '(Inactive)' : '(Active)'}`}
                                textSize={2.2}
                                textScale={store.textScale}
                              />
                              <span className='divider'></span>
                              <div className='row' style={{ flex: '0 0 40%', marginRight: '10px', height: '5vh' }}>
                                <SimpleButton
                                  text={store.adcState ? "On" : "Off"}
                                  textSize={2.2}
                                  textScale={store.textScale}
                                  textColor={'var(--textColorDefault)'}
                                  isActive={true}
                                  onClick={() => { handleIO(adcChannel) }}
                                  backgroundColor={'var(--boxColorDarker)'}
                                />
                              </div>
                            </div>

                            {/*renderSetting("dev", currentSettings)*/}
                            <p />
                          </>
                        }

                        {activeTab === 2 &&
                          <>
                            {renderSetting("dash_topbar", currentSettings)}
                            {renderSetting("dash_classic", currentSettings)}
                            {renderSetting("dash_race", currentSettings)}
                            {renderSetting("dash_charts", currentSettings)}

                            <div className='list row'>
                              <SimpleLabel
                                textColor={'var(--textColorDefault)'}
                                text={'Add / Remove Data'}
                                textSize={2.2}
                                textScale={store.textScale}
                              />
                              <span className='divider'></span>
                              <div className='row' style={{ flex: '0 0 40%', marginRight: '10px', gap: '10%', height: '5vh' }}>
                                <div className='input'>
                                  <SimpleButton
                                    text={"+"}
                                    textSize={2.5}
                                    textScale={store.textScale}
                                    textColor={'var(--textColorDefault)'}
                                    isActive={true}
                                    onClick={() => { handleAddSetting("dash_charts", currentSettings) }}
                                    backgroundColor={'var(--boxColorDarker)'}
                                  />
                                </div>
                                <div className='input'>
                                  <SimpleButton
                                    text={"-"}
                                    textSize={2.5}
                                    textScale={store.textScale}
                                    textColor={'var(--textColorDefault)'}
                                    isActive={true}
                                    onClick={() => { handleRemoveSetting("dash_charts", currentSettings) }}
                                    backgroundColor={'var(--boxColorDarker)'}
                                  />
                                </div>
                              </div>
                            </div>
                            <p />
                          </>
                        }

                        {activeTab === 3 &&
                          <>
                            {renderSetting("comfort", currentSettings)}
                            {renderSetting("lights", currentSettings)}
                            <p />
                          </>
                        }

                        {activeTab === 0 &&
                          <>
                            {renderSetting("carplay", currentSettings)}
                            <p />
                          </>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div className='row' style={{ paddingTop: '2vh', paddingBottom: '2vh', height: '20%' }}>
                  <div className='column'>
                    <SimpleButton
                      text={<h3>Save</h3>}
                      textSize={2.2}
                      textScale={store.textScale}
                      textColor={'var(--textColorLight)'}
                      isActive={true}
                      onClick={() => {saveSettings()}}
                      backgroundColor={'var(--boxColorDark)'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
};


export default Settings;
