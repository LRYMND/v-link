import {
  useEffect,
  useState,
} from 'react'

//import { GooSpinner } from 'react-spinners-kit';

import { io } from "socket.io-client";

import NavBar from '../../sidebars/NavBar';
import TopBar from '../../sidebars/TopBar';
import DashBar from '../../sidebars/DashBar';
import Dashboard from '../dashboard/Dashboard';
import Settings from '../settings/Settings';
//import Volvo from '../volvo/Volvo';

import "./../../../themes.scss"
import './home.scss';

const canbusChannel =   io("ws://localhost:4001/canbus")
const adcChannel  =     io("ws://localhost:4001/adc")
const settingsChannel = io("ws://localhost:4001/settings")


const Home = ({
  applicationSettings,
  setApplicationSettings,
  sensorSettings,
  setSensorSettings,
  view,
  setView,
  phoneState,
  setPhoneState,
  carplayState,
  setCarplayState,
  versionNumber
}) => {
  // Application state variables
  const [startedUp, setStartedUp] = useState(false);

  // Interface state variables
  const [showNavBar, setShowNavBar] = useState(true);
  const [showTopBar, setShowTopBar] = useState(true);
  const [showOsd, setShowOsd] = useState(true);

  // Connection state variables
  const [wifiState, setWifiState] = useState(false);
  const [canState, setCANState] = useState(false);
  const [adcState, setADCState] = useState(false);

  // Canbus state variable

  useEffect(() => {
    // Event listener for receiving settings data
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
      console.log("CAN-status received from socket:", data);
      setADCState(data);
    };

    settingsChannel.on("application", handleAppSettings);
    settingsChannel.on("sensors", handleSensorSettings);

    canbusChannel.on("status", handleCANStatus);
    adcChannel.on("status", handleADCStatus);

    settingsChannel.emit("requestSettings", "application");
    settingsChannel.emit("requestSensors");

    canbusChannel.emit("requestStatus");
    adcChannel.emit("requestStatus");

    return () => {
      settingsChannel.off("application", handleAppSettings);
      settingsChannel.off("sensors", handleSensorSettings);

      canbusChannel.off("canbus", handleCANStatus);
      adcChannel.off("canbus", handleADCStatus);
    };
  }, []);


  useEffect(() => {
    if (applicationSettings != null && sensorSettings != null) {
      setStartedUp(true);
      console.log("Settings loaded.")
    }
  }, [applicationSettings, sensorSettings])


  useEffect(() => {
    if (phoneState === false) setCarplayState(false)

    if (phoneState && (view === 'Carplay')) {
      setShowTopBar(false);
      setShowNavBar(false);
      if (applicationSettings.interface.activateOSD.value)
        setShowOsd(true);
    } else {
      setShowTopBar(true);
      setShowNavBar(true);
      setShowOsd(false);
    }
  }, [phoneState, view]);


  const renderView = () => {
    switch (view) {
      case 'Carplay':
        return (
          <div className='container'>
            {showOsd && phoneState &&
              <DashBar
                className='dashbar'
                sensorSettings={sensorSettings}
                applicationSettings={applicationSettings}
                phoneState={phoneState}
                wifiState={wifiState}
                setView={setView}
              />
            }
          </div >
        )

      case 'Dashboard':
        return (
          <Dashboard
            sensorSettings={sensorSettings}
            applicationSettings={applicationSettings}
          />
        )

      case 'Settings':
        return (
          <Settings
            canState={canState}
            adcState={adcState}
            sensorSettings={sensorSettings}
            applicationSettings={applicationSettings}
            setApplicationSettings={setApplicationSettings}
            versionNumber={versionNumber}
          />
        )

      case 'Volvo':
        return (
          {/* 
          <Volvo
            userSettings={userSettings}
          />
          */}
        )

      case 'Template':
        return (
          <></>
        )

      default:
        return (
          <Dashboard
            sensorSettings={sensorSettings}
            applicationSettings={applicationSettings}
          />
        )

    }
  }


  return (
    <>
      {startedUp ? (
        <div className='container'>
          {showTopBar && (
            <TopBar
              className='topbar'
              applicationSettings={applicationSettings}
              wifiState={wifiState}
              phoneState={phoneState}
            />
          )}

          {renderView()}

          {showNavBar && (
            <NavBar
              className='navbar'
              applicationSettings={applicationSettings}
              view={view}
              setView={setView}
            />
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default Home;
