import { useState, useEffect, useRef, ReactNode } from 'react';

import styled, { useTheme } from 'styled-components';
import ScrollContainer from 'react-indiana-drag-scroll'

import { ToggleSwitch, Select, Input, Button } from '../../../theme/styles/Inputs';
import { Typography } from '../../../theme/styles/Typography';

import { APP } from '../../../store/Store';

import { io } from "socket.io-client";
import SimpleModal from '../../components/SimpleModal';


const appChannel = io("ws://localhost:4001/app")
const sysChannel = io("ws://localhost:4001/sys")

const canChannel = io("ws://localhost:4001/can")
const linChannel = io("ws://localhost:4001/lin")
const adcChannel = io("ws://localhost:4001/adc")
const rtiChannel = io("ws://localhost:4001/rti")

const Spacer = styled.div`
    display: flex;
    justify-content: right;

    height: 100%;
    width: ${({ theme }) => theme.interaction.buttonWidth};

    gap: 10px;

    padding-right: 5px;
    box-sizing: border-box;
`;

const Divider = styled.div`
    flex: 1 1 0px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.dark};
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 5px;
`

const Element = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;

    height: 35px;
    width: 100%;

    margin-bottom: 7px;
`

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-self: right;

    height: 100%;
    width: 100%;

    gap: 10px;

    padding-left: 50px;
    padding-right: 50px;
    box-sizing: border-box;
`;


const Settings = () => {

  /* Load Types */
  const Body1 = Typography.Body1
  const Title = Typography.Title
  const Caption2 = Typography.Caption2

  /* Load Stores */
  const app = APP((state) => state)
  const modules = APP((state) => state.modules)

  const settings = app.settings;
  const system = app.system;

  const theme = useTheme();

  /* Create combined data store for dropdown */
  const dataStores = {}
  Object.entries(modules).map(([key, module]) => {
    const currentModule = module((state) => state);
    if (currentModule.settings.type === 'data')
      //console.log(key)
      Object.assign(dataStores, { [key]: currentModule.settings.sensors })
  });

  /* Open Modal */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null); // State for modal content

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


  /* Handle Settings */
  const [save, setSave] = useState(true)
  const [reset, setReset] = useState(false)
  const [currentSettings, setCurrentSettings] = useState(structuredClone(settings));

  // Change Settings
  const handleSettingChange = (selectStore, key, name, targetSetting, currentSettings) => {
    setSave(false)
    console.log(selectStore, key, name, targetSetting, currentSettings)
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

  // Save Settings
  function saveSettings() {
    setSave(true)
    app.update({ settings: currentSettings });
    appChannel.emit("save", currentSettings);
    appChannel.emit("load");
  }

  // Reset Settings
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
        console.log(event)
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
        console.log(name)

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
        <Element>
          <Body1>{label}</Body1>
          <Divider />
          <Spacer>
            {dropdown ? (
              <Select
                name={setting}
                isActive={true}
                textSize={2.2}
                textScale={system.textScale}
                onChange={handleChange}
                value={value}
              >
                {dropdown.map((option) => (
                  <option key={option.value || option} value={option.value || option}>
                    {option.label || option}
                  </option>
                ))}
              </Select>
            ) : (
              isBoolean ? (
                <ToggleSwitch>
                  <input type="checkbox" name={setting} checked={value} onChange={handleChange} />
                  <span className="slider"></span>
                </ToggleSwitch>
              ) :
                isBinding ? (
                  <Button name={setting} onClick={() => { handleBinding(key, setting) }}>
                    {value}
                  </Button>
                ) :
                  <Input name={setting} type={'number'} value={value} onChange={handleChange} />
            )}
          </Spacer>
        </Element>
      );
    });

    return (
      <>
        <Element>
          <Title> {title.toUpperCase()} </Title>
        </Element>
        {nestedElements}
      </>
    );
  }


  return (
    <Container>
      <SimpleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalContent}
      </SimpleModal>
      <ScrollContainer
        className="scroll-container"
        style={{ width: '100%', height: '100%' }}
        horizontal={false}
        hideScrollbars={true}
        ignoreElements='input, select'
        key={JSON.stringify(reset)}
      >
        {system.settingPage === 1 &&
          <>
            {renderSetting("general", currentSettings)}
            {renderSetting("side_bars", currentSettings)}

            <Element>
            </Element>
            <Element>
              <Caption2>{`CAN ${system.canState ? '(Active)' : '(Inactive)'}`}</Caption2>
              <Divider />
              <ToggleSwitch>
                <input type="checkbox" checked={system.canState} onChange={() => { handleIO("can", canChannel) }} />
                <span className="slider"></span>
              </ToggleSwitch>
            </Element>

            <Element>
              <Caption2>{`LIN ${system.linState ? '(Active)' : '(Inactive)'}`}</Caption2>
              <Divider />
              <ToggleSwitch>
                <input type="checkbox" checked={system.linState} onChange={() => { handleIO("lin", linChannel) }} />
                <span className="slider"></span>
              </ToggleSwitch>
            </Element>

            <Element>
              <Caption2>{`ADC ${system.adcState ? '(Active)' : '(Inactive)'}`}</Caption2>
              <Divider />
              <ToggleSwitch>
                <input type="checkbox" checked={system.adcState} onChange={() => { handleIO("adc", adcChannel) }} />
                <span className="slider"></span>
              </ToggleSwitch>
            </Element>

            <Element>
              <Caption2>{`RTI ${system.rtiState ? '(Active)' : '(Inactive)'}`}</Caption2>
              <Divider />
              <ToggleSwitch>
                <input type="checkbox" checked={system.rtiState} onChange={() => { handleIO("rti", rtiChannel) }} />
                <span className="slider"></span>
              </ToggleSwitch>
            </Element>
            <p />
          </>
        }

        {system.settingPage === 2 &&
          <div style={{ height: '100%', width: '100%', marginTop: '5px', marginBottom: '5px' }}>
            {renderSetting("dash_topbar", currentSettings)}
            {renderSetting("dash_classic", currentSettings)}
            {renderSetting("dash_race", currentSettings)}
            {renderSetting("dash_charts", currentSettings)}

            <Element>
              <Caption2>{'Add / Remove Entries'}</Caption2>
              <Divider />
              <Spacer>
                <Button onClick={() => { handleAddSetting("dash_charts", currentSettings) }} style={{ justifyContent: 'center' }}> + </Button>
                <Button onClick={() => { handleRemoveSetting("dash_charts", currentSettings) }} style={{ justifyContent: 'center' }}> - </Button>
              </Spacer>
            </Element>
            <p />
          </div>
        }

        {system.settingPage === 3 &&
          <>
            {renderSetting("app_bindings", currentSettings)}
            {renderSetting("mmi_bindings", currentSettings)}
          </>
        }

        {system.settingPage === 4 &&
          <>
            <div style={{ display: 'flex', width: '100%', height: '100%', gap: '10px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '10px' }}>
                <Button onClick={() => { systemTask('quit') }} style={{ height: '100%' }}> Quit </Button>
                <Button onClick={() => { systemTask('restart') }} style={{ height: '100%' }}> Restart </Button>
                <Button onClick={() => { systemTask('reboot') }} style={{ height: '100%' }}> Reboot </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '10px' }}>
                <Button onClick={() => { systemTask('reset') }} style={{ height: '100%' }}> Reset </Button>
                <Button onClick={() => { systemTask("rti") }} style={{ height: '100%' }}> {system.rtiState ? "Close RTI" : "Open RTI"} </Button>
                <Button onClick={() => { systemTask("hdmi") }} style={{ height: '100%' }}> Toggle HDMI </Button>
              </div>
            </div>
            <p />
          </>
        }

      </ScrollContainer>
      <Button theme={theme} onClick={() => { saveSettings() }} isActive={save ? false : true}>
        {save ? 'All Settings saved.' : 'Save Settings'}
      </Button>
    </Container>
  )
};


export default Settings;