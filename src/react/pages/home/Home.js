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

import './home.scss';

const socket = io("ws://localhost:5005")
const electron = window.require('electron')
const { ipcRenderer } = electron;

const Home = () => {

  const [streaming, setStreaming] = useState(false)
  const [settings, setSettings] = useState(null);
  const [startedUp, setStartedUp] = useState(false);
  const [showTop, setShowTop] = useState(true);
  const [showNav, setShowNav] = useState(true);
  const [showOsd, setShowOsd] = useState(true);
  const [status, setStatus] = useState(false);
  const [view, setView] = useState('Carplay')



  useEffect(() => {
    ipcRenderer.on('allSettings', (event, data) => { loadSettings(data); });
    ipcRenderer.on('plugged', () => { setStatus(true); console.log('phone connected') });
    ipcRenderer.on('unplugged', () => { setStatus(false); console.log('disconnected') });

    socket.emit('statusReq');
    ipcRenderer.send('getSettings')
    ipcRenderer.send('startScript', {});

    socket.on('carplay', (data) => {
      setStreaming(true);
    });

    socket.on('status', ({ status }) => {
      console.log("status@home: ", status)
      setStatus(status)
    })

    return () => {
      socket.off();
      //ipcRenderer.send('stopScript', {});
      ipcRenderer.removeAllListeners();
    };
  }, [])

  useEffect(() => {
    console.log('update navbar')
    console.log('status: ', status)
    console.log('streaming: ', streaming)
    if (streaming && status && (view === 'Carplay')) {
      setShowTop(false);
      setShowNav(false);
      if (settings.activateOSD)
        setShowOsd(true);
    } else {
      setShowTop(true);
      setShowNav(true);
      setShowOsd(false);
    }

    if (status === false) {
      setStreaming(false)
    }
  }, [streaming, status, view]);

  useEffect(() => {
    if (settings != null) {
      setStartedUp(true);
    }
  }, [settings])

  function loadSettings(data) {
    console.log('loading settings...')
    console.log('settings loaded: ', settings)
    if (data != null) {
      setSettings(data);
    }
  }

  const touchEvent = (type, x, y) => {
    ipcRenderer.send('click', { type: type, x: x, y: y })
  }

  function leaveCarplay() {
    setView('Dashboard')
  }

  const template = () => {
    console.log('hello world')
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
              />
            }
            <div className={`carplay ${settings.colorTheme}`} style={{height: settings.height, width: settings.width}}>
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

              <div className='carplay__load' style={{ height: (status && streaming) ? '0%' : '100%' }}>
                {!status ? <><div>WAITING FOR DEVICE</div><div className='loading'>...</div></> : <></>}
                {(!streaming && status) ? <GooSpinner size={60} color='var(--fillActive)' loading={!streaming} /> : <></>}
              </div>
            </div >
          </div >
        )
      case 'Dashboard':
        return (
          <Dashboard
            settings={settings}
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
      {startedUp &&
        <div className='container'>
          {showTop &&
            <TopBar
              className='topbar'
              settings={settings}
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
        </div>}
    </>
  );
};

export default Home;