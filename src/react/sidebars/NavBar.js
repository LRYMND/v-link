import React, { useState, useEffect } from 'react';

import IconButton from "@mui/material/IconButton";

import NavBarBackground from "./images/navbar.png"
import "../components/themes.scss"
import "./navbar.scss";

const electron = window.require('electron')
const { ipcRenderer } = electron;

const NavBar = ({ settings, view, setView }) => {

  const [showMMI, setShowMMI] = useState(true);
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    ipcRenderer.send('getSettings');
    ipcRenderer.send('wifiUpdate');

    return function cleanup() {
      ipcRenderer.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    setShowMMI(settings.activateMMI);
    setTheme(settings.colorTheme);
  }, [settings]);
  

  function changeView(page) {
    setView(page)
  }

  return (
    <div>
        <div className={`navbar ${theme}`} style={{ backgroundImage: `url(${NavBarBackground})` }}>
          <IconButton onClick={() => changeView('Dashboard')}>
            <svg className="navbar__icon">
              <use xlinkHref="./svg/gauge.svg#gauge"></use>
            </svg>
          </IconButton>

          {showMMI ?
            <IconButton onClick={() => changeView('Carplay')}>
              <svg className="navbar__icon">
                <use xlinkHref="./svg/carplay.svg#carplay"></use>
              </svg>
            </IconButton>
          : <></>}

          <IconButton onClick={() => changeView('Settings')}>
            <svg className="navbar__icon">
              <use xlinkHref="./svg/settings.svg#settings"></use>
            </svg>
          </IconButton>
        </div >
    </div >
  );
};

export default NavBar;
