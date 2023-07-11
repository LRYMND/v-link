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
  const [settings, setSettings] = useState(null);

  const [testSettings, setTestSettings] = useState(null);

  const [streaming, setStreaming] = useState(false);
  const [startedUp, setStartedUp] = useState(false);

  const [showTop, setShowTop] = useState(true);
  const [showNav, setShowNav] = useState(true);
  const [showOsd, setShowOsd] = useState(true);

  const [wifiState, setWifiState] = useState(false);
  const [phoneState, setPhoneState] = useState(false);

  const [carData, setCarData] = useState({
    boost: 0,
    intake: 0,
    coolant: 0,
    voltage: 0,
    lambda1: 0,
    lambda2: 0,
  })

  useEffect(() => {
    ipcRenderer.on('allSettings', (event, args) => { loadTestSettings(args)  });
    ipcRenderer.on('testSettings2', (event, args) => { loadTestSettings(args) });
    ipcRenderer.on('msgFromBackground', (event, args) => { msgFromBackground(args) });
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
    //console.log("settings: ", settings)

    if (streaming && phoneState && (view === 'Carplay')) {
      setShowTop(false);
      setShowNav(false);
      if (settings.interface.activateOSD)
        setShowOsd(true);
    } else {
      setShowTop(true);
      setShowNav(true);
      setShowOsd(false);
    }

    if (phoneState === false) {
      setStreaming(false)
    }
  }, [streaming, phoneState, view, settings]);

  useEffect(() => {
    if (testSettings != null) {
      setStartedUp(true);
    }
  }, [settings, testSettings])

  function loadTestSettings(data) {
    if (data != null) {
      setTestSettings(data);
    }
  }

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
    console.log('hello world')
  }

  const msgFromBackground = (args) => {
    if (args != null)
      if (args.includes("map:")) {
        args = args.replace("map:", "")
        setCarData((prevState) => ({ ...prevState, boost: Number(args).toFixed(2) }));
      }
    if (args.includes("iat:")) {
      args = args.replace("iat:", "")
      setCarData((prevState) => ({ ...prevState, intake: Number(args).toFixed(2) }));
    }
    if (args.includes("col:")) {
      args = args.replace("col:", "")
      setCarData((prevState) => ({ ...prevState, coolant: Number(args).toFixed(2) }));
    }
    if (args.includes("vol:")) {
      args = args.replace("vol:", "")
      setCarData((prevState) => ({ ...prevState, voltage: Number(args).toFixed(2) }));
    }
    if (args.includes("ld1:")) {
      args = args.replace("ld1:", "")
      setCarData((prevState) => ({ ...prevState, lambda1: Number(args).toFixed(2) }));
    }
    if (args.includes("ld2:")) {
      args = args.replace("ld2:", "")
      setCarData((prevState) => ({ ...prevState, lambda2: Number(args).toFixed(2) }));
    }
  }

  const renderView = () => {
    switch (view) {
      case 'Carplay':
        return (
          <div className='container'>
            {showOsd &&
              <DashBar
                className='dashbar'
                settings={testSettings}
                carData={carData}
                phoneState={phoneState}
                wifiState={wifiState}
              />
            }
            <div className={`carplay ${testSettings.app.colorTheme}`} style={{ height: testSettings.carplay.height, width: testSettings.carplay.width }}>
              <div className='carplay__stream'>
                <Carplay
                  settings={testSettings.carplay}
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
            settings={testSettings}
            carData={carData}
          />
        )

      case 'Settings':
        return (
          <Settings
            settings={settings}
            setSettings={setSettings}
            allSettings={testSettings}
            setAllSettings={setTestSettings}
            versionNumber={versionNumber}
          />
        )

      case 'Volvo':
        return (
          <Volvo
            settings={settings}
          />
        )

      case 'Template':
        return (
          <Template
            settings={settings}
          />
        )

      default:
        return (
          <Swiper
            settings={testSettings}
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
              settings={testSettings}
              wifiState={wifiState}
              phoneState={phoneState}
            />
          }
          {renderView()}
          {showNav &&

            <NavBar
              className='navbar'
              settings={testSettings}
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

          <span className='refresh__version'>{versionNumber}</span>
        </div>}
    </>
  );
};

export default Home;
