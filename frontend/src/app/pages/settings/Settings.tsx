import { useState, useEffect, ReactNode } from 'react';
import { APP } from '../../../store/Store';

import { io } from "socket.io-client";

import SimpleButton from '../../components/SimpleButton'
import SimpleInput from '../../components/SimpleInput'
import SimpleSelect from '../../components/SimpleSelect'
import SimpleLabel from '../../components/SimpleLabel'
import SimpleCheckbox from '../../components/SimpleCheckbox'
import SimpleModal from '../../components/SimpleModal';

import "./../../../themes.scss"
import "./../../../styles.scss"

const appChannel = io("ws://localhost:4001/app")
const sysChannel = io("ws://localhost:4001/sys")

const canChannel = io("ws://localhost:4001/can")
const linChannel = io("ws://localhost:4001/lin")
const adcChannel = io("ws://localhost:4001/adc")
const rtiChannel = io("ws://localhost:4001/rti")


const Settings = () => {

  /* Load Stores */
  const modules = APP((state) => state.modules);
  const app = modules['app']((state) => state)

  const settings = app.settings;
  const system = app.system;

  /* Create states */
  const [currentSettings, setCurrentSettings] = useState(structuredClone(settings));
  const [activeTab, setActiveTab] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null); // State for modal content

  /* Create combined data store for dropdown */
  const dataStores = {}
  Object.entries(modules).map(([key, module]) => {
    const currentModule = module((state) => state);
    if (currentModule.settings.type === 'data')
      //console.log(key)
      Object.assign(dataStores, {[key]: currentModule.settings.sensors})
  });

  /* Switch Tabs */
  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  /* Open Modal */
  const openModal = (content) => {  
    // Open the modal with dynamic content
    setModalContent(content);
    setIsModalOpen(true);
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
  const handleSettingChange = (selectStore, key, name, targetSetting, currentSettings) => {
    console.log(selectStore, key, name, targetSetting, currentSettings, dataStores)
    const newSettings = structuredClone(currentSettings);
    let convertedValue
      if(selectStore != 'app') {
        convertedValue = Object.keys(dataStores[selectStore]).find(
        (messageKey) => dataStores[selectStore][messageKey].label === targetSetting
      );
      newSettings[key][name].value = convertedValue || targetSetting;
      newSettings[key][name].type = selectStore;
    } else {
      newSettings[key][name].value = targetSetting
    }

    setCurrentSettings(newSettings);
  };

  /* Save Settings */
  function saveSettings() {
    app.update({settings: currentSettings});
    appChannel.emit("save", currentSettings);
    appChannel.emit("load");
  }

  /* I/O Functionality */
  function systemTask(request) {
    if (request != 'reset') {
      openModal(
        <div>
          <p><strong>Exiting...</strong>.</p>
        </div>
      );
    }
    sysChannel.emit("systemTask", request);
  }

  function handleIO(module, channel) {
    channel.emit("toggle");
  }

  /* Render Settings */
  function renderSetting(key, settingsObj) {
    // NOTES: Settings are grouped into types
    // "System" Settings control the appearance and behaviour of the app. This is the main settings file.
    // "Data" Settings provide parameters for the app and certain system settings
    // "Interface" Settings provide parameter for the behaviour of the interface modules like LIN and RTI

    // System Settings is grouped into different objects. e.g.:
    /*  {
    /*    "application": {
    /*      "label": "Application",         // Cleartext of settings block
    /*      "type": "system",               // Settings type ("system", "data", "interface")
    /*
    /*      "colorTheme": {
    /*          "label": "Color Theme",
    /*          "value": "Green",
    /*          "options": ["Green", "Red", "Blue", "White"],
    /*      },
    /*      (...)
    /*    },
    /*  },
    /*
    /* Based on the "type", either data or interface settings are provided to the main settings file.
    */

    if (!settingsObj) return null;

    // Get label, type, and nested options from setting block
    const { title, type, ...nestedSettings } = settingsObj[key];

    const nestedElements = Object.entries(nestedSettings).map(([setting, content]) => {
      let value, label;
      const dataOptions = {}

      // Get current value
      if (type === "data" && content.type != null) {             // Is the setting responsible for handling data and is a data type assigned?               
        label = content.label
        value = dataStores[content.type][content.value].label    // Read content from combined data store
        Object.keys(dataStores).forEach((storeType) => {         // Dataoptions is mapping the sensor, e.g. "Boost" to the corresponding settingsfile, in this case "can"
          Object.keys(dataStores[storeType]).forEach((key) => {
            const label = dataStores[storeType][key].label       // YES? Grab label from combined data store
            dataOptions[label] = storeType                       // YES? Grab data type from combined data store
          });
        }); 
      } else {        
        label = content.label                                    // NO?  Grab label from "system"-store
        value = content.value                                    // NO?  Grab value from "system"-store
      }

      // Get options
      //Check if value is a number or boolean
      const dropdown = (typeof value === 'number' || typeof value === 'boolean' || key === 'bindings') 
        ? null                                                                    //Yes? Return null
        : (content.options || Object.keys(dataOptions).map((key) =>               //No?  Create dropdown from options
          key
        ))              
      // Check for boolean setting
      const isBoolean = typeof value === 'boolean';                               // Checks if the setting is a boolean.
      const isBinding = key === 'bindings'

      const handleChange = (event) => {
        const { name, value, checked, type } = event.target;                      // Grab info from the handler
        console.log(name, value, checked, type)
        const newValue = type === 'checkbox' ? checked :                          // Check if type is a boolean
                         type === 'number' ? Number(value) : value;               // Check if type is a number

        console.log(dataOptions)
        console.log(newValue)

        //const newStore = dataOptions[newValue]                                    // Define store for selected setting. E.g. "Boost" -> "Oil Pressure" requires a change from "can" to "adc" store.
        let selectStore
        if (Object.keys(dataOptions).length > 1) {
          selectStore = dataOptions[newValue]
        } else {
          selectStore = "app"
        }

        const targetSetting = isBoolean ? checked : newValue                      // Handle targetSetting based on type
        console.log(selectStore, key, name, targetSetting, currentSettings)

        handleSettingChange(selectStore, key, name, targetSetting, settingsObj);     // Execute change of settings
      };

      /*
      const handleBinding = () => {
        console.log("Press key to change binding")
      };
      */

      const handleBinding = (setting) => {
        openModal(
          <div>
            <p><strong>Press a Key or ESC.</strong>.</p>
          </div>
        );
        // Define the key press handler
        const handleKeyPress = (event) => {
          const pressedKey = event.code; // Get the key code
          if(event.code != 'Escape') handleSettingChange("app", "bindings", setting, pressedKey, settingsObj);
          setIsModalOpen(false); // Close the modal
          document.removeEventListener('keydown', handleKeyPress); // Clean up listener
        };
      
        // Add event listener for key press
        document.addEventListener('keydown', handleKeyPress);
      };

      return (
        <div className='list row' key={setting}>
          <SimpleLabel
            textColor={'var(--textColorDefault)'}
            text={label}
            textSize={2.2}
            textScale={system.textScale}
          />

          <span className='divider'></span>
          <div className='column' style={{ flex: '0 0 40%', justifyContent: 'center', alignItems: 'center' }}>
            {dropdown ? (
              <SimpleSelect
                name={setting}
                value={value}
                options={dropdown}
                onChange={handleChange}
                textSize={2.2}
                textScale={system.textScale}
                textColor={'var(--textColorDefault)'}
                isActive={true}
              />
            ) : (
              isBoolean ? (
                <SimpleCheckbox
                  name={setting}
                  checked={value}
                  onChange={handleChange}
                  colorActive={'var(--themeDefault)'}
                  colorInactive={'var(--boxColorDark)'}
                  borderColor={'var(--boxColorDarker)'}
                  isActive={true}
                />
              ) :
              isBinding ? (
                <SimpleButton
                text={value}
                textSize={2.2}
                textScale={system.textScale}
                textColor={'var(--textColorDefault)'}
                isActive={true}
                onClick={() => { handleBinding(setting)}}
                backgroundColor={'var(--boxColorDarker)'}
                />
              ) :
                <SimpleInput
                type='number'
                name={setting}
                value={value}
                onChange={handleChange}
                textSize={2.2}
                textScale={system.textScale}
                textColor={'var(--textColorDefault)'}
                isActive={true}
              />
            )}
          </div>
        </div>
      );
    });

    return (
      <>
        <div className='row'>
          <SimpleLabel
            textColor={'var(--textColorLight)'}
            text={<h3> {title} </h3>}
            textSize={2.2}
            textScale={system.textScale}
          />
        </div>
        {nestedElements}
      </>
    );
  }

  const clickTest = () => {
    console.log('Click :)');
  };


  return (
    <>
      <SimpleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalContent}
      </SimpleModal>

      <div className={`settings ${settings.general.colorTheme.value}`} style={{
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
                      textScale={system.textScale}
                    />
                  </div>

                  <div className='row' style={{ marginBottom: '10%' }}>
                    <div className='column'>
                      <SimpleButton
                        text={"Coming Soon"}
                        textSize={2.2}
                        textScale={system.textScale}
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
                      textScale={system.textScale}
                    />
                  </div>

                  <div className='row' style={{ height: '50%', justifyContent: 'center' }}>
                    <div className='column' style={{ gap: '10%' }}>
                      <SimpleButton
                        text={"Reboot"}
                        textSize={2.2}
                        textScale={system.textScale}
                        textColor={'var(--textColorDefault)'}
                        isActive={true}
                        onClick={() => { systemTask('reboot') }}
                        backgroundColor={'var(--boxColorDark)'}
                      />
                      <SimpleButton
                        text={"Restart"}
                        textSize={2.2}
                        textScale={system.textScale}
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
                        textScale={system.textScale}
                        textColor={'var(--textColorDefault)'}
                        isActive={true}
                        onClick={() => { systemTask('quit') }}
                        backgroundColor={'var(--boxColorDark)'}
                      />
                      <SimpleButton
                        text={"Reset"}
                        textSize={2.2}
                        textScale={system.textScale}
                        textColor={'var(--textColorDefault)'}
                        isActive={true}
                        onClick={() => { systemTask('reset') }}
                        backgroundColor={'var(--boxColorDark)'}
                      />
                    </div>
                  </div>

                  <div className='row'>
                    <label><i>v{system.version}</i></label>
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
                      text={<b>SYSTEM</b>}
                      textSize={2.5}
                      textScale={system.textScale}
                      textColor={activeTab === 1 ? 'var(--textColorLight)' : 'var(--textColorDark)'}
                      isActive={true}
                      backgroundColor={activeTab === 1 ? 'var(--boxColorDark)' : 'var(--boxColorDarker)'}
                      onClick={() => handleTabChange(1)}
                    />

                    <SimpleButton
                      height={'100%'}
                      text={<b>DATA</b>}
                      textSize={2.5}
                      textScale={system.textScale}
                      textColor={activeTab === 2 ? 'var(--textColorLight)' : 'var(--textColorDark)'}
                      isActive={true}
                      backgroundColor={activeTab === 2 ? 'var(--boxColorDark)' : 'var(--boxColorDarker)'}
                      onClick={() => handleTabChange(2)}
                    />

                    <SimpleButton
                      height={'100%'}
                      text={<b>INTERFACE</b>}
                      textSize={2.5}
                      textScale={system .textScale}
                      textColor={activeTab === 3 ? 'var(--textColorLight)' : 'var(--textColorDark)'}
                      isActive={true}
                      backgroundColor={activeTab === 3 ? 'var(--boxColorDark)' : 'var(--boxColorDarker)'}
                      onClick={() => handleTabChange(3)}
                    />
                  </div>
                </div>

                <div className='row' style={{ height: '70%' }}>
                  <div className='frame' style={{ margin: '10px', height: '100%', backgroundColor: 'var(--boxColorDark)' }}>
                    <div className='column' style={{ height: '80%', justifyContent: 'center' }}>
                      <div className='scroller  scrollbar-styles' style={{ height: '90%', width: '90%', justifyContent: 'flex-start' }}>

                        {activeTab === 1 &&
                          <>
                            {renderSetting("general", currentSettings)}
                            {renderSetting("side_bars", currentSettings)}

                            <div className='row'>
                              <SimpleLabel
                                textColor={'var(--textColorLight)'}
                                text={<h3> System Threads </h3>}
                                textSize={2.2}
                                textScale={system.textScale}
                              />
                            </div>

                            <div className='list row'>
                              <SimpleLabel
                                textColor={'var(--textColorDefault)'}
                                text={`CAN ${system.canState ? '(Active)' : '(Inactive)'}`}
                                textSize={2.2}
                                textScale={system.textScale}
                              />
                              <span className='divider'></span>
                              <div className='row' style={{ flex: '0 0 40%', marginRight: '10px', height: '5vh' }}>
                                <SimpleButton
                                  text={system.canState ? "Off" : "On"}
                                  textSize={2.2}
                                  textScale={system.textScale}
                                  textColor={'var(--textColorDefault)'}
                                  isActive={true}
                                  onClick={() => { handleIO("can", canChannel) }}
                                  backgroundColor={'var(--boxColorDarker)'}
                                />
                              </div>
                            </div>

                            <div className='list row'>
                              <SimpleLabel
                                textColor={'var(--textColorDefault)'}
                                text={`LIN ${system.linState ? '(Active)' : '(Inactive)'}`}
                                textSize={2.2}
                                textScale={system.textScale}
                              />
                              <span className='divider'></span>
                              <div className='row' style={{ flex: '0 0 40%', marginRight: '10px', height: '5vh' }}>
                                <SimpleButton
                                  text={system.linState ? "Off" : "On"}
                                  textSize={2.2}
                                  textScale={system.textScale}
                                  textColor={'var(--textColorDefault)'}
                                  isActive={true}
                                  onClick={() => { handleIO("lin", linChannel) }}
                                  backgroundColor={'var(--boxColorDarker)'}
                                />
                              </div>
                            </div>

                            <div className='list row'>
                              <SimpleLabel
                                textColor={'var(--textColorDefault)'}
                                text={`ADC ${system.adcState ? '(Active)' : '(Inactive)'}`}
                                textSize={2.2}
                                textScale={system.textScale}
                              />
                              <span className='divider'></span>
                              <div className='row' style={{ flex: '0 0 40%', marginRight: '10px', height: '5vh' }}>
                                <SimpleButton
                                  text={system.adcState ? "Off" : "On"}
                                  textSize={2.2}
                                  textScale={system.textScale}
                                  textColor={'var(--textColorDefault)'}
                                  isActive={true}
                                  onClick={() => { handleIO("adc", adcChannel) }}
                                  backgroundColor={'var(--boxColorDarker)'}
                                />
                              </div>
                            </div>

                            <div className='list row'>
                              <SimpleLabel
                                textColor={'var(--textColorDefault)'}
                                text={`RTI ${system.rtiState ? '(Active)' : '(Inactive)'}`}
                                textSize={2.2}
                                textScale={system.textScale}
                              />
                              <span className='divider'></span>
                              <div className='row' style={{ flex: '0 0 40%', marginRight: '10px', height: '5vh' }}>
                                <SimpleButton
                                  text={system.rtiState ? "Off" : "On"}
                                  textSize={2.2}
                                  textScale={system.textScale}
                                  textColor={'var(--textColorDefault)'}
                                  isActive={true}
                                  onClick={() => { handleIO("rti", rtiChannel) }}
                                  backgroundColor={'var(--boxColorDarker)'}
                                />
                              </div>
                            </div>
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
                                textScale={system.textScale}
                              />
                              <span className='divider'></span>
                              <div className='row' style={{ flex: '0 0 40%', marginRight: '10px', gap: '10%', height: '5vh' }}>
                                <div className='input'>
                                  <SimpleButton
                                    text={"+"}
                                    textSize={2.5}
                                    textScale={system.textScale}
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
                                    textScale={system.textScale}
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
                            {renderSetting("bindings", currentSettings)}
                            <p />
                          </>
                        }

                        {/*activeTab === 4 &&
                          <>
                            {renderSetting("comfort", currentSettings)}
                            {renderSetting("lights", currentSettings)}
                            <p />
                          </>
                        */}

                        {/*activeTab === 0 &&
                          <>
                            {renderSetting("carplay", currentSettings)}
                            <p />
                          </>
                        */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='row' style={{ paddingTop: '2vh', paddingBottom: '2vh', height: '20%' }}>
                  <div className='column'>
                    <SimpleButton
                      text={<h3>Save Settings</h3>}
                      textSize={2.2}
                      textScale={system.textScale}
                      textColor={'var(--textColorLight)'}
                      isActive={true}
                      onClick={() => { saveSettings() }}
                      backgroundColor={'var(--boxColorDark)'}
                    />
                  </div>
                  <div className='column'>
                    <SimpleButton
                      text={<h3>{system.rtiState ? "Close RTI" : "Open RTI"}</h3>}
                      textSize={2.2}
                      textScale={system.textScale}
                      textColor={'var(--textColorLight)'}
                      isActive={true}
                      onClick={() => { systemTask("rti") }}
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
