import React, { useState, useEffect } from 'react';

import IconButton from "@mui/material/IconButton";

import NavBarBackground from "./images/navbar.png"
import "../themes.scss";
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
          <IconButton onClick={() => changeView('Dashboard')} style={{ fill: (view === 'Dashboard') ? 'var(--fillActive)' : 'var(--fillInactive)' }}>
            <svg className="navbar__icon">
              <use xlinkHref="./svg/gauge.svg#gauge"></use>
            </svg>
          </IconButton>

          {showMMI ?
            <IconButton onClick={() => changeView('Carplay')} style={{ fill: (view === 'Carplay') ? 'var(--fillActive)' : 'var(--fillInactive)' }}>
              <svg className="navbar__icon">
                <use xlinkHref="./svg/carplay.svg#carplay"></use>
              </svg>
            </IconButton>
          : <></>}

          <IconButton onClick={() => changeView('Settings')} style={{ fill: (view === 'Settings') ? 'var(--fillActive)' : 'var(--fillInactive)' }}>
            <svg className="navbar__icon">
              <use xlinkHref="./svg/settings.svg#settings"></use>
            </svg>
          </IconButton>


          {/*
          //HIDDEN UNTIL FEATURES ARE IMPLEMENTED
          
          <IconButton onClick={() => changeView('Volvo')} style={{ fill: (view === 'Volvo') ? 'var(--fillActive)' : 'var(--fillInactive)' }}>
            <svg className="navbar__icon">
              <use xlinkHref="./svg/car.svg#car"></use>
            </svg>
          </IconButton>
          */}

        </div >
    </div >
  );
};

export default NavBar;
