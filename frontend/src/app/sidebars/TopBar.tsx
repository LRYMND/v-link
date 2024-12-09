import { useState, useEffect, } from "react";
import { APP } from '../../store/Store';

import "./../../styles.scss"
import "./../../themes.scss"

const TopBar = () => {

  const app = APP((state) => state)

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
    <div className={`topbar ${app.settings.general.colorTheme.value}`} style={{
      background: 'var(--bgGradient2)',
      height: `${app.settings.side_bars.topBarHeight.value}px`,
      width: `100%`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      top: 0,
    }}>
      <div style={{
        display: 'flex',
        flexDirection:'row',
        height: `${app.settings.side_bars.topBarHeight.value * 2}px`,
        width: `${app.system.contentSize.width - (app.settings.general.contentPadding.value * 2)}px`,
        marginTop: '-40px',
        alignItems: 'flex-end',
        }}>
        <div className='column' style={{height: `${app.settings.side_bars.topBarHeight.value}px`}}>
          <div className='row'>
            <div style={{ display: 'flex', alignItems:'center', gap: '20px' }}>
              <svg className={`status-icon status-icon--${(app.system.wifiState ? "active" : "inactive")}`}>
                <use xlinkHref="/assets/svg/wifi.svg#wifi"></use>
              </svg>
              <svg className={`status-icon status-icon--${'inactive'}`}>
                <use xlinkHref="/assets/svg/bluetooth.svg#bluetooth"></use>
              </svg>
              <svg className={`status-icon status-icon--${(app.system.phoneState ? "active" : "inactive")}`}>
                <use xlinkHref="/assets/svg/phone.svg#phone"></use>
              </svg>
            </div>
          </div>
        </div>
        <div className='column' style={{height: `${app.settings.side_bars.topBarHeight.value}px`, justifyContent: 'flex-start', flex:`0 1 50%`}}>
          <svg viewBox="0 0 350.8 48.95" xmlns="http://www.w3.org/2000/svg">
            <use xlinkHref="/assets/svg/typo.svg#volvo"></use>
          </svg>
        </div>
        <div className='column' style={{height: `${app.settings.side_bars.topBarHeight.value}px`, justifyContent:'center'}}>
          <h2 style={{ color: "var(--themeDefault)" }}>{time.toLocaleTimeString('sv-SV', { hour: '2-digit', minute: '2-digit' })} </h2>
        </div>
      </div>
    </div>

  );
};


export default TopBar;
