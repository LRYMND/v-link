import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import NavBar from './sidebars/NavBar';
import TopBar from './sidebars/TopBar';

import Dashboard from './pages/dashboard/Dashboard';
import CarplayWindow from './pages/carplay/CarplayWindow';
import Settings from './pages/settings/Settings';

import './App.css';

let socket;

const App = () => {
  const { ipcRenderer } = window;

  const [showNav, setShowNav] = useState(true);
  const [settings, setSettings] = useState(null);
  const [startedUp, setStartedUp] = useState(false);
  const [connected, setConnected] = useState(false);

  function loadSettings(data) {
    console.log('loading settings...')
    if (data != null) {
      setSettings(data);
    }
  }

  useEffect(() => {
    if (settings != null) {
      console.log('settings loaded: ', settings);
      setStartedUp(true);
    }

  }, [settings])

  useEffect(() => {
    socket = new WebSocket('ws://localhost:3001');
    socket.binaryType = 'arraybuffer';
    socket.addEventListener('open', () => { setConnected(true); console.log('socket connected')});

    ipcRenderer.send('getSettings');
    ipcRenderer.on('allSettings', (event, data) => { loadSettings(data) });

    return function cleanup() {
      socket.removeEventListener('open', () => { setConnected(true); console.log('socket connected')});
      ipcRenderer.removeAllListeners('allSettings');
    };
  }, []);

  return (
    startedUp && <HashRouter>
      {
        showNav && <>
          <TopBar />
          <NavBar />
        </>
      }
      <Routes>
        <Route path='/dashboard' element={<Dashboard
          settings={settings}
        />} />
        <Route path='/' element={<CarplayWindow
          setShowNav={setShowNav}
          settings={settings}
          socket={socket}
          connected={connected}
        />} />
        <Route path='/settings' element={<Settings
          settings={settings}
        />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
