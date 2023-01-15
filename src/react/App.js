import { HashRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import React, { useState, useEffect, Component } from 'react';


import NavBar from "./sidebars/NavBar";
import TopBar from "./sidebars/TopBar";

import Dashboard from "./pages/dashboard/Dashboard";
import CarplayWindow from "./pages/carplay/CarplayWindow";
import Settings from "./pages/settings/Settings";


const App = () => {

  const { ipcRenderer } = window;

  const [showNav, setShowNav] = useState(true);
  const [settings, setSettings] = useState(null);
  const [startedUp, setStartedUp] = useState(false);

  function loadSettings(data) {
    if (data != null) {
      setSettings(data);
    }
  }

  useEffect(() => {
    if (settings != null) {
      console.log("settings loaded: ", settings);
      console.log("settings loaded: ", settings.colorTheme);
      setStartedUp(true);
      console.log("started up");
    }

  }, [settings])

    useEffect(() => {
    ipcRenderer.send('getSettings');
    ipcRenderer.on('allSettings', (event, data) => { loadSettings(data) });

    return function cleanup() {
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
        <Route path="/dashboard" element={<Dashboard
          settings={settings}
        />} />
        <Route path="/" element={<CarplayWindow
          setShowNav={setShowNav}
          settings={settings}
        />} />
        <Route path="/settings" element={<Settings
          settings={settings}
        />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
