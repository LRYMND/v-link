import React, { useState, useEffect } from 'react';
import { GooSpinner } from 'react-spinners-kit';
import { Carplay } from 'react-js-carplay'
import { io } from "socket.io-client";

import NavBar from '../../sidebars/NavBar';
import TopBar from '../../sidebars/TopBar';
import DashBar from '../../sidebars/DashBar';

import Swiper from '../swiper/Swiper';
import Settings from '../settings/Settings';
import Volvo from '../volvo/Volvo';
import Template from '../_template/Template';

import "../../themes.scss"
import './home.scss';

const socket = io("ws://localhost:5005")
const electron = window.require('electron')
const { ipcRenderer } = electron;
const versionNumber = process.env.PACKAGE_VERSION;


const Home = () => {
  const [view, setView] = useState('Dashboard')

  const [userSettings, setUserSettings] = useState(null);
  const [canbusSettings, setCanbusSettings] = useState(null);

  const [streaming, setStreaming] = useState(false);
  const [startedUp, setStartedUp] = useState(false);

  const [showTop, setShowTop] = useState(true);
  const [showNav, setShowNav] = useState(true);
  const [showOsd, setShowOsd] = useState(true);

  const [wifiState, setWifiState] = useState(false);
  const [phoneState, setPhoneState] = useState(false);

  const [carData, setCarData] = useState({})


  useEffect(() => {
    ipcRenderer.on('userSettings', (event, args) => { loadSettings(args, 'user') });
    ipcRenderer.on('canbusSettings', (event, args) => { loadSettings(args, 'canbus') });

    ipcRenderer.on('msgFromBackground', (event, args) => { updateCardata(args) });

    ipcRenderer.on('wifiOn', () => { setWifiState(true) });
    ipcRenderer.on('wifiOff', () => { setWifiState(false) });
    ipcRenderer.on("plugged", () => { setPhoneState(true) });
    ipcRenderer.on("unplugged", () => { setPhoneState(false) });

    return () => {
      ipcRenderer.removeAllListeners();
    };
  })


  useEffect(() => {
    socket.on('carplay', (data) => {
      setStreaming(true);
    });

    socket.on('status', ({ status }) => {
      console.log("socket status: ", status)
      setPhoneState(status)
    })

    socket.emit('statusReq');

    ipcRenderer.send('statusReq');
    ipcRenderer.send('updateWifi');
    ipcRenderer.send('getSettings');

    return () => {
      socket.off();
      ipcRenderer.removeAllListeners();
    };
  }, [])


  useEffect(() => {
    console.log("streaming: ", streaming)
    console.log("phoneState: ", phoneState)
    console.log("view: ", view)

    if (streaming && phoneState && (view === 'Carplay')) {
      setShowTop(false);
      setShowNav(false);
      if (userSettings.interface.activateOSD)
        setShowOsd(true);
    } else {
      setShowTop(true);
      setShowNav(true);
      setShowOsd(false);
    }

    if (phoneState === false) {
      setStreaming(false)
    }
  }, [streaming, phoneState, view, userSettings]);


  useEffect(() => {
    if (userSettings != null) {
      setStartedUp(true);
    }
  }, [userSettings])


  function loadSettings(data, obj) {
    if (data != null) {
      if (obj === 'user') {
        setUserSettings(data);
      } else {
        setCanbusSettings(data);
  
        const canbusKeys = Object.keys(data.messages);
        const initialCardata = canbusKeys.reduce(function(data, key) {
          data[key] = 0;
          return data;
        }, {});
  
        setCarData(initialCardata);
      }
    }
  }


  const updateCardata = (args) => {
    if (args != null) {
      Object.keys(canbusSettings.messages).forEach((key) => {
        const message = canbusSettings.messages[key];
        const rtviId = message.rtvi_id;
  
        if (args.includes(rtviId)) {
          const value = args.replace(rtviId, "");
          setCarData((prevState) => ({ ...prevState, [key]: Number(value).toFixed(2) }));
        }
      });
    }
  };


  function reloadApp() {
    ipcRenderer.send('reqReload');
  };


  const touchEvent = (type, x, y) => {
    ipcRenderer.send('click', { type: type, x: x, y: y })
  }


  function leaveCarplay() {
    setView('Dashboard')
  }


  const template = () => {
    return null;
  }


  const renderView = () => {
    switch (view) {
      case 'Carplay':
        return (
          <div className='container'>
            {showOsd &&
              <DashBar
                className='dashbar'
                canbusSettings={canbusSettings}
                userSettings={userSettings}
                carData={carData}
                phoneState={phoneState}
                wifiState={wifiState}
              />
            }
            <div className={`carplay ${userSettings.app.colorTheme}`} style={{ height: userSettings.carplay.height, width: userSettings.carplay.width }}>
              <div className='carplay__stream'>
                <Carplay
                  settings={userSettings.carplay}
                  status={true}
                  openModal={false}
                  touchEvent={touchEvent}
                  openModalReq={leaveCarplay}
                  closeModalReq={template}
                />
              </div >

              <div className='carplay__load' style={{ height: (phoneState && streaming) ? '0%' : '100%' }}>
                {!phoneState ? <><div>WAITING FOR DEVICE</div><div className='loading'>...</div></> : <></>}
                {(!streaming && phoneState) ? <GooSpinner size={60} color='var(--fillActive)' loading={!streaming} /> : <></>}
              </div>
            </div >
          </div >
        )
        
      case 'Dashboard':
        return (
          <Swiper
            canbusSettings={canbusSettings}
            userSettings={userSettings}
            carData={carData}
          />
        )

      case 'Settings':
        return (
          <Settings
            canbusSettings={canbusSettings}
            userSettings={userSettings}
            setUserSettings={setUserSettings}
            versionNumber={versionNumber}
          />
        )

      case 'Volvo':
        return (
          <Volvo
            userSettings={userSettings}
          />
        )

      case 'Template':
        return (
          <Template
            userSettings={userSettings}
          />
        )

      default:
        return (
          <Swiper
            canbusSettings={canbusSettings}
            userSettings={userSettings}
            carData={carData}
          />
        )

    }
  }


  return (
    <>
      {startedUp ?
        <div className='container'>
          {showTop &&
            <TopBar
              className='topbar'
              userSettings={userSettings}
              wifiState={wifiState}
              phoneState={phoneState}
            />
          }

          {renderView()}

          {showNav &&
            <NavBar
              className='navbar'
              userSettings={userSettings}
              view={view}
              setView={setView}
            />
          }
        </div>
        :
        <div className='refresh'>
          <button className='refresh__button' type='button' onClick={reloadApp}>
            <h1>RTVI</h1>
          </button>
          <span className='refresh__version'>v{versionNumber}</span>
        </div>}
    </>
  );
};


export default Home;
