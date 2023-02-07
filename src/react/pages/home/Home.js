import React, { useState, useEffect } from 'react';
import { GooSpinner } from 'react-spinners-kit';
import { Carplay } from 'react-js-carplay'
import { io } from "socket.io-client";

import NavBar from '../../sidebars/NavBar';
import TopBar from '../../sidebars/TopBar';

import Dashboard from '../dashboard/Dashboard';
import Settings from '../settings/Settings';
import Template from '../template/Template';

import './home.scss';

const electron = window.require('electron')
const { ipcRenderer } = electron;

const Home = () => {
  const socket = io("ws://localhost:5005")

  const [socketConnected, setSocketConnected] = React.useState()
  const [time, setTime] = React.useState({ minutes: 0, seconds: 0 })
  const [streaming, setStreaming] = React.useState(false)
  const [settings, setSettings] = useState(null);
  const [startedUp, setStartedUp] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [status, setStatus] = useState(false);
  const [view, setView] = React.useState('Carplay')


  useEffect(() => {
    ipcRenderer.on('allSettings', (event, data) => { loadSettings(data); });
    ipcRenderer.on('plugged', () => { setStatus(true); console.log('phone connected') });
    ipcRenderer.on('unplugged', () => { setStatus(false); console.log('disconnected') });

    ipcRenderer.send('statusReq');
    ipcRenderer.send('getSettings')

    socket.on('carplay', (data) => {
      if (data != null) {
        setStreaming(true);
      }
    });

    return () => {
      socket.off();
    };
  }, [])

  useEffect(() => {
    if (streaming && view == 'Carplay') {
      setShowNav(false);
    } else {
      setShowNav(true);
    }
  }, [streaming, status, view]);

  useEffect(() => {
    if (settings != null) {
      setStartedUp(true);
    }
  }, [settings])

  function loadSettings(data) {
    console.log('loading settings...')
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
          <div className='carplay'>
            <div className='carplay__load' style={{ height: (streaming) ? '0%' : '100%' }}>
              {/*status ? <GooSpinner size={60} color='var(--fillActive)' loading={!streaming} /> : <h1>Waiting for device.</h1>*/}
              <GooSpinner size={60} color='var(--fillActive)' loading={!streaming} />
            </div>
            <div className='carplay__stream' style={{ height: (status && streaming) ? '100%' : '0%' }}>
              <Carplay
                settings={settings}
                status={true}
                openModal={false}
                touchEvent={touchEvent}
                openModalReq={leaveCarplay}
                closeModalReq={template}
              />
            </div>
          </div>
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
          {showNav && <>
            <TopBar />
            <NavBar
              settings={settings}
              view={view}
              setView={setView}
            />
          </>
          }
          {renderView()}
        </div>}
    </>
  );
};

export default Home;
