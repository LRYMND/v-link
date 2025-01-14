import { useState, useEffect } from 'react'
import { APP, KEY } from '../store/Store';

import Dashboard from './pages/dashboard/Dashboard';
import Settings from './pages/settings/Settings';

import "./../themes.scss";
import "./../styles.scss";

const Content = () => {
  const viewMap = {
    Dashboard: Dashboard,
    Carplay: () => <div style={{ height: "0px" }}></div>,
    Settings: Settings,
  };

  const app = APP((state) => state);
  const key = KEY((state) => state);


  const renderView = () => {
    const Component = viewMap[app.system.view] || Dashboard;
    return <Component />;
  };

  useEffect(() => {
    // The hotkey for changing the pages needs to be stores in the system store so App.tsx has access.
    app.update({ system: { switch: app.settings.app_bindings.switch.value } })
  }, [app.settings.app_bindings.switch]);

  useEffect(() => {
    // Provide the parent's handler reference with the local function
    if (key.keyStroke == app.system.switch)
      cycleView()
    //app.update({system: {lastKey: ''}})
  }, [key.keyStroke]);

  // Function to cycle to the next view
  const cycleView = () => {
    // Get the keys (names of views) from the viewMap object
    const viewKeys = Object.keys(viewMap);

    // Find the current index in the keys array
    let currentIndex = viewKeys.indexOf(app.system.view);

    // If we're on the last view, wrap around to the first one
    if (currentIndex === viewKeys.length - 1) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }

    app.update({ system: { view: viewKeys[currentIndex] } })
  };


  return (
    <>
      {app.system.startedUp ? (
        <div style={{
          height: `${app.system.contentSize.height}px`,
          width: `${app.system.contentSize.width}px`,
          display: `${app.system.view === "Carplay" ? 'none' : 'flex'}`,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div className='content' style={{
            height: `${app.system.contentSize.height - (app.settings.general.contentPadding.value)}px`,
            width: `${app.system.contentSize.width -(app.settings.general.contentPadding.value * 2)}px`,

            fontFamily: 'Helvetica',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',

          }}>

            {renderView()}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default Content;
