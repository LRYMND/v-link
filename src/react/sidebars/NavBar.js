import React from "react";
import "./navbar.scss";
import "../components/themes.scss"
import NavBarBackground from "./images/navbar.png"

import { NavLink } from "react-router-dom";

const NavBar = ({navbar}) => {

  const Store = window.require('electron-store');
  const store = new Store();
  const theme = store.get("colorTheme");

  return (
    <div className={`navbar ${theme}`} style={{ backgroundImage: `url(${NavBarBackground})` }}>
      <NavLink to={"/dashboard"}>
        <svg className="navbar__icon">
          <use xlinkHref="./svg/gauge.svg#gauge"></use>
        </svg>
      </NavLink>

      <NavLink to={"/"}>
        <svg className="navbar__icon">
          <use xlinkHref="./svg/carplay.svg#carplay"></use>
        </svg>
      </NavLink>

      <NavLink to={"/settings"}>
        <svg className="navbar__icon">
          <use xlinkHref="./svg/settings.svg#settings"></use>
        </svg>
      </NavLink>
    </div>
  );
};

export default NavBar;
