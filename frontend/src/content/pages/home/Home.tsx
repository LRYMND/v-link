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

const canbusChannel = io("ws://localhost:4001/canbus")
const settingsChannel = io("ws://localhost:4001/settings")


const Home = ({
  applicationSettings,
  setApplicationSettings,
  canbusSettings,
  setCanbusSettings,
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
  const [canState, setCanState] = useState(false);

  // Canbus state variable

  useEffect(() => {
    // Event listener for receiving settings data
    const handleApplicationSettings = (data) => {
      console.log("App-settings received from socket:", data);
      setApplicationSettings(data);
    };

    const handleCanbusSettings = (data) => {
      console.log("CAN-settings received from socket:", data);
      setCanbusSettings(data);
    };

    const handleCanbusStatus = (data) => {
      console.log("CAN-status received from socket:", data);
      setCanState(data);
    };

    settingsChannel.on("application", handleApplicationSettings);
    settingsChannel.on("canbus", handleCanbusSettings);
    canbusChannel.on("status", handleCanbusStatus);

    settingsChannel.emit("requestSettings", "application");
    settingsChannel.emit("requestSettings", "canbus");
    canbusChannel.emit("requestStatus");

    return () => {
      settingsChannel.off("application", handleApplicationSettings);
      canbusChannel.off("canbus", handleCanbusSettings);
    };
  }, []);

  useEffect(() => {
    if (applicationSettings != null) {
      setStartedUp(true);
      console.log("Application settings loaded.")
    }
  }, [applicationSettings])


  useEffect(() => {
    if (canbusSettings != null) {
      console.log("Canbus settings loaded.")
    }
  }, [canbusSettings])


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
                canbusSettings={canbusSettings}
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
            canbusSettings={canbusSettings}
            applicationSettings={applicationSettings}
          />
        )

      case 'Settings':
        return (
          <Settings
            canState={canState}
            canbusSettings={canbusSettings}
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
            canbusSettings={canbusSettings}
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
