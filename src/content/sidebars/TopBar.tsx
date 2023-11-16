import { useState, useEffect, } from "react";

import "./../../styles.scss"
import "./../../themes.scss"
import "./topbar.scss";

const TopBar = ({ applicationSettings, phoneState, wifiState }) => {
  
  const [time, setDate] = useState(new Date());


  function updateTime() {
    setDate(new Date());
  }


  useEffect(() => {
    const timer1 = setInterval(updateTime, 10000);

    return function cleanup() {
      clearInterval(timer1);
    };
  }, []);


  return (
    <div className={`topbar ${applicationSettings.app.colorTheme.value}`}>
      <div className="topbar__info">
        <svg className={`status-icon status-icon--${(wifiState ? "active" : "inactive")}`}>
          <use xlinkHref="/assets/svg/wifi.svg#wifi"></use>
        </svg>
        <svg className={`status-icon status-icon--${'inactive'}`}>
          <use xlinkHref="/assets/svg/bluetooth.svg#bluetooth"></use>
        </svg>
        <svg className={`status-icon status-icon--${(phoneState ? "active" : "inactive")}`}>
          <use xlinkHref="/assets/svg/phone.svg#phone"></use>
        </svg>
      </div>
      <div>
        <div className="topbar__banner">
          <svg className="topbar__banner__graphic">
            <use xlinkHref="/assets/svg/volvo-banner.svg#volvo"></use>
          </svg>
        </div>
      </div>
      <div className="topbar__time">
        <div className="topbar__time__container">
          <h2>{time.toLocaleTimeString('sv-SV', { hour: '2-digit', minute: '2-digit' })} </h2>
        </div>
      </div>
    </div>

  );
};


export default TopBar;
