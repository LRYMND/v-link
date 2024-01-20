import { useEffect, useState } from 'react'

import './App.css'

import Settings from './Settings'

import Splash from './content/pages/splash/Splash'
import Home from './content/pages/home/Home'
import Carplay from './content/carplay/Carplay'
import Cardata from './content/cardata/Cardata'

import NavBar from './content/sidebars/NavBar';
import TopBar from './content/sidebars/TopBar';
import DashBar from './content/sidebars/DashBar';

function App() {
  const versionNumber = "2.1.0"

  const [loaded, setLoaded] = useState(false)

  const [applicationSettings, setApplicationSettings] = useState(null)
  const [sensorSettings, setSensorSettings] = useState(null)
  const [view, setView] = useState(null)

  const [canState, setCANState] = useState(false);
  const [adcState, setADCState] = useState(false);

  const [phoneState, setPhoneState] = useState(false);
  const [carplayState, setCarplayState] = useState(false);
  const [wifiState, setWifiState] = useState(false);

  const [showNavBar, setShowNavBar] = useState(true);
  const [showTopBar, setShowTopBar] = useState(true);
  const [showDashBar, setShowDashBar] = useState(true);

  useEffect(() => {
    if (applicationSettings && sensorSettings) {
      setView(applicationSettings.app.startPage.value)
      setLoaded(true)
    }

  }, [applicationSettings, sensorSettings])

  useEffect(() => {
    if (phoneState === false) setCarplayState(false)
  }, [phoneState])

  useEffect(() => {
    if (phoneState && (view === 'Carplay')) {
      if (applicationSettings != null)
        setShowTopBar(false);
      setShowNavBar(false);
      if (applicationSettings.app.activateDashbar.value)
        setShowDashBar(true);
    } else {
      if (applicationSettings != null)
        setShowTopBar(true);
      setShowNavBar(true);
      setShowDashBar(false);
    }
  }, [view, phoneState, applicationSettings, sensorSettings]);

  return (
    <div style={{ overflow: 'hidden', width: '100%', height: '100%' }}>

      <Cardata />
      <Splash
        versionNumber={versionNumber}
      />
      <Settings
        setApplicationSettings={setApplicationSettings}
        setSensorSettings={setSensorSettings}
        setCANState={setCANState}
        setADCState={setADCState}
      />

      {loaded ?
        <>
          {showDashBar && phoneState &&
            <DashBar
              className='dashbar'
              sensorSettings={sensorSettings}
              applicationSettings={applicationSettings}
              phoneState={phoneState}
              wifiState={wifiState}
              setView={setView}
            />
          }
          {showTopBar && (
            <TopBar
              className='topbar'
              applicationSettings={applicationSettings}
              wifiState={wifiState}
              phoneState={phoneState}
            />
          )}

          <div className='carplay'>
            <Carplay
              applicationSettings={applicationSettings}
              phoneState={setPhoneState}
              carplayState={setCarplayState}
              setPhoneState={setPhoneState}
              setCarplayState={setCarplayState}
              view={view}
              setView={setView}
            />
          </div>
          <Home
            applicationSettings={applicationSettings}
            sensorSettings={sensorSettings}
            view={view}
            setView={setView}
            phoneState={phoneState}
            carplayState={carplayState}
            canState={canState}
            adcState={adcState}
            versionNumber={versionNumber}
          />

          {showNavBar && (
            <NavBar
              className='navbar'
              applicationSettings={applicationSettings}
              view={view}
              setView={setView}
            />
          )}
        </> : <></>}
    </div>
  )
}

export default App
