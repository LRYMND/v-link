import React, { useEffect } from 'react';

import { io } from "socket.io-client";

const canbusChannel = io("ws://localhost:4001/canbus")
const adcChannel = io("ws://localhost:4001/adc")
const settingsChannel = io("ws://localhost:4001/settings")

const Settings = ({
  setApplicationSettings,
  setSensorSettings,
  setCANState,
  setADCState,
}) => {
  useEffect(() => {
    const handleAppSettings = (data) => {
      console.log("App-settings received from socket:", data);
      setApplicationSettings(data);
    };

    const handleSensorSettings = (data) => {
      console.log("Sensor-settings received from socket:", data);
      setSensorSettings(data);
    };

    const handleCANStatus = (data) => {
      console.log("CAN-status received from socket:", data);
      setCANState(data);
    };

    const handleADCStatus = (data) => {
      console.log("ADC-status received from socket:", data);
      setADCState(data);
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
