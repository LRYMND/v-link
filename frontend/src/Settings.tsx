import { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import { ApplicationSettings, SensorSettings, Store } from './content/store/Store';

const canbusChannel = io("ws://localhost:4001/canbus")
const adcChannel = io("ws://localhost:4001/adc")
const settingsChannel = io("ws://localhost:4001/settings")

const Settings = () => {

  const applicationSettings = ApplicationSettings((state) => state.applicationSettings);
  const sensorSettings = SensorSettings((state) => state.sensorSettings);
  const store = Store((state) => state);

  const updateApplicationSettings = ApplicationSettings((state) => state.updateApplicationSettings);
  const updateSensorSettings = SensorSettings((state) => state.updateSensorSettings);
  const updateStore = Store((state) => state.updateStore);

  const [initialized, setInitialized] = useState(false);
  const [windowSize, setWindowSize] = useState(false);

  /* Wait for App Settings */
  useEffect(() => {
    if (Object.keys(applicationSettings).length && Object.keys(sensorSettings).length > 0) {
      updateStore({
        view: applicationSettings.app.startPage.value,
      })
      if (!initialized) {
        setInitialized(true)
      }
    }
  }, [applicationSettings, sensorSettings])


  /* Handle Window Resize */
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      updateStore({ windowSize: { width: window.innerWidth, height: window.innerHeight } })
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  /* Handle Content Resize */
  useEffect(() => {
    const handleResize = () => {
      if (initialized) {
        //console.log("Resize Logic")
        const topBar = applicationSettings.side_bars.topBarHeight.value
        const navBar = applicationSettings.side_bars.navBarHeight.value
        const config = (applicationSettings.side_bars.topBarAlwaysOn.value ? topBar + navBar : navBar)

        const newContentSize = { width: store.windowSize.width, height: (store.windowSize.height - (topBar + navBar)) };
        const newCarplaySize = { width: store.windowSize.width, height: store.windowSize.height - config };

        updateStore({
          startedUp: true,
          contentSize: newContentSize,
          carplaySize: newCarplaySize,
        })
      }
    };

    handleResize();
  }, [windowSize, initialized])


  /* Handle Text Resize */
  useEffect(() => {
    if (initialized) {
      const multiplier: applicationSettings.app.textSize.options = {
        "Small": .75,
        "Default": 1,
        "Large": 1.25,
      };

      updateStore({ textScale: multiplier[applicationSettings.app.textSize.value] })
    }
  }, [applicationSettings, initialized])


  /* Handle Interface Visibility */
  useEffect(() => {
    if (store.view === 'Carplay' && applicationSettings != null) {
      if (store.phoneState && (store.view === 'Carplay')) {
        updateStore({ interface: { topBar: false, navBar: false } })

        if (applicationSettings.side_bars.topBarAlwaysOn.value)
          updateStore({ interface: { dashBar: true } })
      }
    } else {
      updateStore({ interface: { dashBar: false, topBar: true, navBar: true, content: true, carplay: false } })
    }
  }, [store.view, store.phoneState, applicationSettings]);


  useEffect(() => {
    const handleAppSettings = (data) => {
      //console.log("App-settings received from socket:", data);
      updateApplicationSettings(data)
    };

    const handleSensorSettings = (data) => {
      //console.log("Sensor-settings received from socket:", data);
      updateSensorSettings(data)
    };

    const handleCANStatus = (data) => {
      //console.log("CAN-status received from socket:", data);
      updateStore({ canState: data });
    };

    const handleADCStatus = (data) => {
      //console.log("ADC-status received from socket:", data);
      updateStore({ adcState: data });
    };

    // Add event listeners for settings and status updates
    settingsChannel.on("application", handleAppSettings);
    settingsChannel.on("sensors", handleSensorSettings);
    canbusChannel.on("status", handleCANStatus);
    adcChannel.on("status", handleADCStatus);

    // Request initial data
    settingsChannel.emit("requestSettings", "application");
    settingsChannel.emit("requestSensors");
    canbusChannel.emit("requestStatus");
    adcChannel.emit("requestStatus");

    // Cleanup on unmount
    return () => {
      settingsChannel.off("application", handleAppSettings);
      settingsChannel.off("sensors", handleSensorSettings);
      canbusChannel.off("status", handleCANStatus);
      adcChannel.off("status", handleADCStatus);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default Settings;
