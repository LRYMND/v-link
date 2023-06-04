import React, { useState, useEffect } from 'react';
import { GooSpinner } from 'react-spinners-kit';
import { Carplay } from 'react-js-carplay'
import { io } from "socket.io-client";

import NavBar from '../../sidebars/NavBar';
import TopBar from '../../sidebars/TopBar';
import DashBar from '../../sidebars/DashBar';

import Dashboard from '../dashboard/Dashboard';
import Settings from '../settings/Settings';
import Template from '../template/Template';

import "../../themes.scss"
import './home.scss';

const socket = io("ws://localhost:5005")
const electron = window.require('electron')
const { ipcRenderer } = electron;

const Home = () => {
  const [view, setView] = useState('Carplay')
  const [settings, setSettings] = useState(null);

  const [streaming, setStreaming] = useState(false);
  const [startedUp, setStartedUp] = useState(false);

  const [showTop, setShowTop] = useState(true);
  const [showNav, setShowNav] = useState(true);
  const [showOsd, setShowOsd] = useState(true);

  const [boost, setBoost] = useState(0);
  const [intake, setIntake] = useState(0);
  const [coolant, setCoolant] = useState(0);
  const [voltage, setVoltage] = useState(0);

  const [wifiState, setWifiState] = useState(false);
  const [phoneState, setPhoneState] = useState(false);

  useEffect(() => {
    ipcRenderer.on('allSettings', (event, data) => { loadSettings(data);});
    ipcRenderer.on('msgFromBackground', (event, args) => { msgFromBackground(args) });
    ipcRenderer.on('wifiOn', () => { setWifiState(true)});
    ipcRenderer.on('wifiOff', () => { setWifiState(false)});
    ipcRenderer.on("plugged", () => { setPhoneState(true)});
    ipcRenderer.on("unplugged", () => { setPhoneState(false)});

    return () => {
      ipcRenderer.removeAllListeners();
    };
  })

  useEffect(() => {
    socket.on('carplay', (data) => {
      setStreaming(true);
    });

    socket.on('status', ({ status  }) => {
      console.log("status@home: ", status)
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
    console.log('update navbar')
    console.log('status: ', phoneState)
    console.log('streaming: ', streaming)
    if (streaming && phoneState && (view === 'Carplay')) {
      setShowTop(false);
      setShowNav(false);
      if (settings.activateOSD)
        setShowOsd(true);
    } else {
      setShowTop(true);
      setShowNav(true);
      setShowOsd(false);
    }

    if (phoneState === false) {
      setStreaming(false)
    }
  }, [streaming, phoneState, view]);

  useEffect(() => {
    if (settings != null) {
      setStartedUp(true);
    }
  }, [settings])

  function loadSettings(data) {
    if (data != null) {
      setSettings(data);
      console.log('settings loaded: ', data)
    }
  }

  function reloadApp() {
    ipcRenderer.send('getSettings');
    //ipcRenderer.send('reqReload');
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
      //console.log("Debug: ", args);

      if (args.includes("map:")) {
        args = args.replace("map:", "")
        setBoost(Number(args).toFixed(2));
      }
    if (args.includes("iat:")) {
      args = args.replace("iat:", "")
      setIntake(Number(args).toFixed(2));
    }
    if (args.includes("col:")) {
      args = args.replace("col:", "")
      setCoolant(Number(args).toFixed(2));
    }
    if (args.includes("vol:")) {
      args = args.replace("vol:", "")
      setVoltage(Number(args).toFixed(2));
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
                settings={settings}
                boost={boost}
                intake={intake}
                coolant={coolant}
                voltage={voltage}
                phoneState={phoneState}
                wifiState={wifiState}
              />
            }
            <div className={`carplay ${settings.colorTheme}`} style={{ height: settings.height, width: settings.width }}>
              <div className='carplay__stream'>
                <Carplay
                  settings={settings}
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
          <Dashboard
            settings={settings}
            boost={boost}
            intake={intake}
            coolant={coolant}
            voltage={voltage}
          />
        )

      case 'Settings':
        return (
          <Settings
            settings={settings}
            setSettings={setSettings}
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
          <Dashboard
            settings={settings}
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
              settings={settings}
              wifiState={wifiState}
              phoneState={phoneState}
            />
          }
          {renderView()}
          {showNav &&

            <NavBar
              className='navbar'
              settings={settings}
              view={view}
              setView={setView}
            />
          }
        </div>
        :
        <div className='refresh'>
          <button className='refresh__button' type='button' onClick={reloadApp}>
          <svg className="refresh__icon">
            <use xlinkHref="./svg/volvologo.svg#volvologo"></use>
          </svg>
        </button>
          </div>}
    </>
  );
};

export default Home;