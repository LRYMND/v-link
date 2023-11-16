import {
  useEffect,
  useState,
} from 'react'

//import { GooSpinner } from 'react-spinners-kit';

import { io } from "socket.io-client";

import NavBar from '../../sidebars/NavBar';
import TopBar from '../../sidebars/TopBar';
import DashBar from '../../sidebars/DashBar';
import Swiper from '../swiper/Swiper';
import Settings from '../settings/Settings';
//import Volvo from '../volvo/Volvo';

import "./../../../themes.scss"
import './home.scss';

const canbusChannel = io("ws://localhost:4001/canbus")
const settingsChannel = io("ws://localhost:4001/settings")
const versionNumber = "2.0"


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
  setCarplayState
}) => {
  // Application state variables
  const [startedUp, setStartedUp] = useState(false);

  // Interface state variables
  const [showNavBar, setShowNavBar] = useState(true);
  const [showTopBar, setShowTopBar] = useState(true);
  const [showOsd, setShowOsd] = useState(true);

  // Connection state variables
  const [wifiState, setWifiState] = useState(false);

  // Canbus state variable
  const [carData, setCarData] = useState({})

  useEffect(() => {
    // Initial request for settings when component mounts
    settingsChannel.emit("requestSettings", "application");
    settingsChannel.emit("requestSettings", "canbus");
  }, []);

  useEffect(() => {
    //Dummyvalues
    setCarData({
      intake: 12.3,
      boost: 1.1,
      coolant: 94.5,
      lambda1: .9,
      lambda2: .85,
      voltage: 14.2,
    });

    // Event listener for receiving settings data
    const handleApplicationSettings = (data) => {
      console.log("Data received from socket:", data);
      setApplicationSettings(data);
    };

    const handleCanbusSettings = (data) => {
      console.log("Data received from socket:", data);
      setCanbusSettings(data);
    };

    settingsChannel.on("application", handleApplicationSettings);
    settingsChannel.on("canbus", handleCanbusSettings);

    // Cleanup function for removing the event listener when the component is unmounted
    return () => {
      settingsChannel.off("application", handleApplicationSettings);
      settingsChannel.off("canbus", handleCanbusSettings);
    };
  }, []);

  useEffect(() => {
    // Event listener for receiving canbus data
    const handleCanbusData = (data) => {
      console.log("Data received from canbus:", data);
      updateCardata(data);
    };

    settingsChannel.on("data", handleCanbusData);

    // Cleanup function for removing the event listener when the component is unmounted
    return () => {
      settingsChannel.off("application", handleApplicationSettings);
      settingsChannel.off("canbus", handleCanbusSettings);
    };
  }, []);

  useEffect(() => {
    console.log("Updating application-settings");
    if (applicationSettings != null) {
      setStartedUp(true);
      console.log("Settings loaded.")
    }
  }, [applicationSettings])

  useEffect(() => {
    console.log("Updating canbus-settings");
    if (canbusSettings != null) {
      console.log("Settings loaded.")
    }
  }, [canbusSettings])


  const updateCardata = (data) => {
    if (data != null) {
      Object.keys(canbusSettings.messages).forEach((key) => {
        const message = canbusSettings.messages[key];
        const rtviId = message.rtvi_id;

        if (data.includes(rtviId)) {
          const value = data.replace(rtviId, "");
          setCarData((prevState) => ({ ...prevState, [key]: Number(value).toFixed(2) }));
        }
      });
    }
  };

  useEffect(() => {
    console.log("phone connected: ", phoneState)
    console.log("view: ", view)

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
                carData={carData}
                phoneState={phoneState}
                wifiState={wifiState}
                setView={setView}
              />
            }
          </div >
        )

      case 'Dashboard':
        return (
          <Swiper
            canbusSettings={canbusSettings}
            applicationSettings={applicationSettings}
            carData={carData}
          />
        )

      case 'Settings':
        return (
          <Settings
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
          <Swiper
            canbusSettings={canbusSettings}
            applicationSettings={applicationSettings}
            carData={carData}
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
