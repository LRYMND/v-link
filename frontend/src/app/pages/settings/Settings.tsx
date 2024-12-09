import { useState, useEffect, useRef, ReactNode } from 'react';
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
  const app = APP((state) => state)
  const modules = APP((state) => state.modules)

  const settings = app.settings;
  const system = app.system;


  /* Create states */
  const [currentSettings, setCurrentSettings] = useState(structuredClone(settings));
  const [activeTab, setActiveTab] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null); // State for modal content

  const [save, setSave] = useState(true)
  const [reset, setReset] = useState(false)
  const [moose, setMoose] = useState(false)

  const [isDragging, setIsDragging] = useState(false);  // State to track if the user is dragging
  const [startY, setStartY] = useState(0);  // The initial Y position of the mouse
  const [scrollTop, setScrollTop] = useState(0);  // To track the scroll position
  const containerRef = useRef(null);  // Reference for the scrollable container

  // Function to handle mouse down event (start of dragging)
  const handleMouseDown = (e) => {
    setIsDragging(true);  // User is dragging
    setStartY(e.clientY);  // Save the initial mouse Y position
    setScrollTop(containerRef.current.scrollTop);  // Save the current scroll position
  };

  // Function to handle mouse move event (dragging in progress)
  const handleMouseMove = (e) => {
    if (!isDragging) return;  // Only scroll if dragging
    const deltaY = startY - e.clientY;  // Calculate how much the mouse has moved
    containerRef.current.scrollTop = scrollTop + deltaY;  // Adjust scroll position based on movement
  };

  // Function to handle mouse up event (end of dragging)
  const handleMouseUp = () => {
    setIsDragging(false);  // Stop dragging when mouse is released
  };

  /* Create combined data store for dropdown */
  const dataStores = {}
  Object.entries(modules).map(([key, module]) => {
    const currentModule = module((state) => state);
    if (currentModule.settings.type === 'data')
      //console.log(key)
      Object.assign(dataStores, { [key]: currentModule.settings.sensors })
  });

  /* Switch Tabs */
  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  /* Open Modal */
  const openModal = (content) => {
    // Open the modal with dynamic content
    app.update({ system: { modal: true } })
    setModalContent(content);
    setIsModalOpen(true);
    app.update({ system: { modal: false } })
  };

  /* Add Settings */
  const handleAddSetting = (key, currentSettings) => {
    if (currentSettings.constants.chart_input_current < currentSettings.constants.chart_input_max) {
      const newSetting = {
        type: "can",
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
    //console.log(selectStore, key, name, targetSetting, currentSettings, dataStores)
    setSave(false)
    const newSettings = structuredClone(currentSettings);
    let convertedValue
    if (selectStore != 'app') {
      convertedValue = Object.keys(dataStores[selectStore]).find(
        (messageKey) => dataStores[selectStore][messageKey].label === targetSetting
      );
      newSettings[key][name].value = convertedValue || targetSetting;
      newSettings[key][name].type = selectStore;
    } else {
      console.log(key, name, targetSetting)
      newSettings[key][name].value = targetSetting
    }

    setCurrentSettings(newSettings);
  };

  /* Save Settings */
  function saveSettings() {
    setSave(true)
    app.update({ settings: currentSettings });
    appChannel.emit("save", currentSettings);
    appChannel.emit("load");
  }

  /* Reset Settings */
  function systemTask(request) {
    if (!['reset', 'rti', 'hdmi'].includes(request)) {
      openModal(
        <div>
          <p><strong>Exiting...</strong>.</p>
        </div>
      );
    }

    sysChannel.emit("systemTask", request);
    setReset(true)
  }


  useEffect(() => {
    if (reset) {
      setCurrentSettings(app.settings)
      setReset(false)
    }
  }, [app.settings])

  /* Toggle Threads */
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
      const dropdown = (typeof value === 'number' || typeof value === 'boolean' || key.includes('bindings'))
        ? null                                                                    //Yes? Return null
        : (content.options || Object.keys(dataOptions).map((key) =>               //No?  Create dropdown from options
          key
        ))
      // Check for boolean setting
      const isBoolean = typeof value === 'boolean';                               // Checks if the setting is a boolean.
      const isBinding = key.includes('bindings')                                  // Checks if the setting handles bindings


      const handleChange = (event) => {
        const { name, value, checked, type } = event.target;                      // Grab info from the handler
        const newValue = type === 'checkbox' ? checked :                          // Check if type is a boolean
          type === 'number' ? Number(value) : value;               // Check if type is a number

        //const newStore = dataOptions[newValue]                                    // Define store for selected setting. E.g. "Boost" -> "Oil Pressure" requires a change from "can" to "adc" store.
        let selectStore
        if (Object.keys(dataOptions).length > 1) {
          selectStore = dataOptions[newValue]
        } else {
          selectStore = "app"
        }

        const targetSetting = isBoolean ? checked : newValue                      // Handle targetSetting based on type
        //console.log(selectStore, key, name, targetSetting, currentSettings)

        handleSettingChange(selectStore, key, name, targetSetting, settingsObj);     // Execute change of settings
      };



      const handleBinding = (key, setting) => {
        console.log(key, setting)
        openModal(
          <div>
            <p><strong>Press a Key or ESC.</strong>.</p>
          </div>
        );
        // Define the key press handler
        const handleKeyPress = (event) => {
          if (event.code === 'Escape') {
            handleSettingChange("app", key, setting, "Unassigned", settingsObj);
          } else {
            handleSettingChange("app", key, setting, event.code, settingsObj);
          }

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
                    onClick={() => { handleBinding(key, setting) }}
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
    //console.log('Click :)');
  };


  return (
    <>
      <SimpleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalContent}
      </SimpleModal>

      <div key={JSON.stringify(reset)} className={`settings ${settings.general.colorTheme.value}`} style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>

        <div className='column' style={{ padding: '0px', height: '90%', justifyContent: 'space-around' }}>
          <div className='row' style={{ height: '90%' }}>
            <div className='column' style={{ gap: '3vh' }}>
              <div className='row' style={{ height: '10%' }}>
                <h1>SETTINGS</h1>
              </div>

              <div className='row'>
                <button className="nav-button" onClick={() => handleTabChange(1)} style={{ fill: (activeTab === 1) ? 'var(--themeDefault)' : 'var(--boxColorLighter)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width='3vh' height='3vh'>
                    <use xlinkHref="/assets/svg/settings2.svg#settings2"></use>
                  </svg>
                </button>
                <SimpleButton
                  height={'100%'}
                  text={<b>GENERAL</b>}
                  textSize={2}
                  textScale={system.textScale}
                  textColor={activeTab === 1 ? 'var(--textColorLight)' : 'var(--textColorDark)'}
                  isActive={true}
                  backgroundColor={activeTab === 1 ? 'transparent' : 'transparent'}
                  onClick={() => handleTabChange(1)}
                />
              </div>

              <div className='row'>
                <button className="nav-button" onClick={() => handleTabChange(2)} style={{ fill: (activeTab === 2) ? 'var(--themeDefault)' : 'var(--boxColorLighter)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width='3vh' height='3vh'>
                    <use xlinkHref="/assets/svg/car.svg#car"></use>
                  </svg>
                </button>
                <SimpleButton
                  height={'100%'}
                  text={<b>INTERFACE</b>}
                  textSize={2}
                  textScale={system.textScale}
                  textColor={activeTab === 2 ? 'var(--textColorLight)' : 'var(--textColorDark)'}
                  isActive={true}
                  backgroundColor={activeTab === 2 ? 'transparent' : 'transparent'}
                  onClick={() => handleTabChange(2)}
                />
              </div>

              <div className='row'>
                <button className="nav-button" onClick={() => handleTabChange(3)} style={{ fill: (activeTab === 3) ? 'var(--themeDefault)' : 'var(--boxColorLighter)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width='3vh' height='3vh'>
                    <use xlinkHref="/assets/svg/steering.svg#steering"></use>
                  </svg>
                </button>
                <SimpleButton
                  height={'100%'}
                  text={<b>KEYMAP</b>}
                  textSize={2}
                  textScale={system.textScale}
                  textColor={activeTab === 3 ? 'var(--textColorLight)' : 'var(--textColorDark)'}
                  isActive={true}
                  backgroundColor={activeTab === 1 ? 'transparent' : 'transparent'}
                  onClick={() => handleTabChange(3)}
                />
              </div>

              <div className='row'>
                <button className="nav-button" onClick={() => handleTabChange(4)} style={{ fill: (activeTab === 4) ? 'var(--themeDefault)' : 'var(--boxColorLighter)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width='3vh' height='3vh'>
                    <use xlinkHref="/assets/svg/io.svg#io"></use>
                  </svg>
                </button>
                <SimpleButton
                  height={'100%'}
                  text={<b>SYSTEM</b>}
                  textSize={2}
                  textScale={system.textScale}
                  textColor={activeTab === 4 ? 'var(--textColorLight)' : 'var(--textColorDark)'}
                  isActive={true}
                  backgroundColor={activeTab === 1 ? 'transparent' : 'transparent'}
                  onClick={() => handleTabChange(4)}
                />
              </div>

              <div className='row'>
                <button className="nav-button" onClick={() => {
                  setMoose(true)
                  openModal(
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <h1>You found the Turbo-Button!</h1>
                      <p>Sadly, it doesn't do anything.</p>
                    </div>
                  )
                }} style={{ fill: moose ? 'var(--themeDefault)' : 'transparent' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width='3vh' height='3vh'>
                    <use xlinkHref="/assets/svg/moose.svg#moose"></use>
                  </svg>
                </button>
                <SimpleButton
                  height={'100%'}
                  text={<i>V-Link v{system.version}</i>}
                  textSize={1.5}
                  textScale={system.textScale}
                  textColor={'var(--textColorDark)'}
                  isActive={false}
                  backgroundColor={activeTab === 1 ? 'transparent' : 'transparent'}
                  onClick={() => handleTabChange(4)}
                />
              </div>
            </div>


            <div className='column' style={{ flex: '0 1 70%', gap: '3vh' }}>
              <div className='frame'>
                <div className='row' style={{ height: '70%' }}>
                  <div className='frame' style={{ height: '100%', backgroundColor: 'var(--boxColorDark)' }}>
                    <div className='column' style={{ height: '80%', justifyContent: 'center' }}>
                      <div
                        ref={containerRef}
                        className='scroller  scrollbar-styles'
                        style={{ height: '90%', width: '90%', justifyContent: 'flex-start' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}>

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
                                <SimpleCheckbox
                                  name={"canState"}
                                  checked={system.canState}
                                  onChange={() => { handleIO("can", canChannel) }}
                                  colorActive={'var(--themeDefault)'}
                                  colorInactive={'var(--boxColorDark)'}
                                  borderColor={'var(--boxColorDarker)'}
                                  isActive={true}
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
                                <SimpleCheckbox
                                  name={"linState"}
                                  checked={system.linState}
                                  onChange={() => { handleIO("lin", linChannel) }}
                                  colorActive={'var(--themeDefault)'}
                                  colorInactive={'var(--boxColorDark)'}
                                  borderColor={'var(--boxColorDarker)'}
                                  isActive={true}
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
                                <SimpleCheckbox
                                  name={"adcState"}
                                  checked={system.adcState}
                                  onChange={() => { handleIO("adc", adcChannel) }}
                                  colorActive={'var(--themeDefault)'}
                                  colorInactive={'var(--boxColorDark)'}
                                  borderColor={'var(--boxColorDarker)'}
                                  isActive={true}
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
                                <SimpleCheckbox
                                  name={"rtiState"}
                                  checked={system.rtiState}
                                  onChange={() => { handleIO("rti", rtiChannel) }}
                                  colorActive={'var(--themeDefault)'}
                                  colorInactive={'var(--boxColorDark)'}
                                  borderColor={'var(--boxColorDarker)'}
                                  isActive={true}
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
                              <div className='row' style={{ flex: '0 0 40%', marginTop: '15px', marginRight: '10px', gap: '10%', height: '5vh' }}>
                                <div className='input'>
                                  <SimpleButton
                                    text={"+"}
                                    width={'4rem'}
                                    height={'2rem'}
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
                                    width={'4rem'}
                                    height={'2rem'}
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
                            {renderSetting("app_bindings", currentSettings)}
                            {renderSetting("mmi_bindings", currentSettings)}
                          </>
                        }

                        {activeTab === 4 &&
                          <>
                            <div className='row' style={{ height: '90%', justifyContent: 'center' }}>
                              <div className='column' style={{ gap: '3vh' }}>
                                <SimpleButton
                                  text={"Quit"}
                                  textSize={2.2}
                                  textScale={system.textScale}
                                  textColor={'var(--textColorDefault)'}
                                  isActive={true}
                                  onClick={() => { systemTask('quit') }}
                                  backgroundColor={'var(--warmGreyMedium)'}
                                />

                                <SimpleButton
                                  text={"Restart"}
                                  textSize={2.2}
                                  textScale={system.textScale}
                                  textColor={'var(--textColorDefault)'}
                                  isActive={true}
                                  onClick={() => { systemTask('restart') }}
                                  backgroundColor={'var(--warmGreyMedium)'}
                                />

                                <SimpleButton
                                  text={"Reboot"}
                                  textSize={2.2}
                                  textScale={system.textScale}
                                  textColor={'var(--textColorDefault)'}
                                  isActive={true}
                                  onClick={() => { systemTask('reboot') }}
                                  backgroundColor={'var(--warmGreyMedium)'}
                                />
                              </div>

                              <div className='column' style={{ gap: '3vh' }}>

                                <SimpleButton
                                  text={"Reset"}
                                  textSize={2.2}
                                  textScale={system.textScale}
                                  textColor={'var(--textColorDefault)'}
                                  isActive={true}
                                  onClick={() => { systemTask('reset') }}
                                  backgroundColor={'var(--warmGreyMedium)'}
                                />

                                <SimpleButton
                                  height={'100%'}
                                  text={<div>{system.rtiState ? "Close RTI" : "Open RTI"}</div>}
                                  textSize={2.2}
                                  textScale={system.textScale}
                                  textColor={'var(--textColorDefault)'}
                                  isActive={true}
                                  onClick={() => { systemTask("rti") }}
                                  backgroundColor={'var(--warmGreyMedium)'}
                                />

                                <SimpleButton
                                  height={'100%'}
                                  text={<div>Toggle HDMI</div>}
                                  textSize={2.2}
                                  textScale={system.textScale}
                                  textColor={'var(--textColorDefault)'}
                                  isActive={true}
                                  onClick={() => { systemTask("hdmi") }}
                                  backgroundColor={'var(--warmGreyMedium)'}
                                />
                              </div>
                            </div>
                            <p />
                          </>
                        }

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
              </div>

              <div className='row' style={{ height: '10vh' }}>
                <SimpleButton
                  height={'100%'}
                  text={save ? 'All Settings saved.': 'Save Settings'}
                  textSize={2}
                  textScale={system.textScale}
                  textColor={'var(--textColorLight)'}
                  isActive={save ? false : true}
                  onClick={() => { saveSettings() }}
                  backgroundColor={'var(--warmGreyLight)'}
                />
              </div>
            </div>
          </div>
        </div>
      </div >
    </>
  )
};


export default Settings;
