import React from "react";
import "./navbar.scss";
import NavBarBackground from "./images/navbar.png"

import { NavLink } from "react-router-dom";

const NavBar = ({navbar}) => {
  return (
    <div className="nav" style={{ backgroundImage: `url(${NavBarBackground})` }}>
      <NavLink to={"/dashboard"}>
        <svg className="nav__icon">
          <use xlinkHref="./svg/home.svg#home"></use>
        </svg>
      </NavLink>

      <NavLink to={"/"}>
        <svg className="nav__icon">
          <use xlinkHref="./svg/carplay.svg#carplay"></use>
        </svg>
      </NavLink>

      <NavLink to={"/settings"}>
        <svg className="nav__icon">
          <use xlinkHref="./svg/settings.svg#settings"></use>
        </svg>
      </NavLink>
    </div>
  );
};

export default NavBar;
