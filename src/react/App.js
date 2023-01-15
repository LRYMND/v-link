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

  //const ws = new WebSocket('ws://localhost:3001');
  //ws.binaryType = 'arraybuffer';

  /*
  const socket = io('http://localhost:3000')

  const [isConnected, setIsConnected] = useState(socket.connected);

  
  useEffect(() => {
    socket.on("connect", setIsConnected(true));
    socket.on("disconnect", setIsConnected(false));

    console.log("Is connected? ", isConnected);


    return function cleanup() {
      socket.off('connect');
      socket.off('disconnect');
    }
  }, [])

  const connectSocket = () => {
    socketConnectT("localhost:3000")
  }

  useEffect(() => {
    connectSocket()
    return () => {
      disconnect()
    };
  }, []);

  const socketConnectT = (host) => {
    console.log("connecting host", host)
    return { type: "SOCKET_CONNECT", host }
  }

  const disconnect = () => {
    console.log("disconnecting")
    return { type: "SOCKET_CONNECT" }
  }
  

  useEffect(() => {
    console.log("Is connected? ", isConnected);
  }, [isConnected])
  */

  const [showNav, setShowNav] = useState(true);
  //const [status, setStatus] = useState(false);
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
          //ws={socket}
          //type={"socket.io"}
          settings={settings}
          //setStatus={setStatus}
          //settings={settings}
          //connectSocket={connectSocket}
        />} />
        <Route path="/settings" element={<Settings
          settings={settings}
        />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
