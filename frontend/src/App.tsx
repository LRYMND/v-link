import {
  useState,
} from 'react'

import './App.css'

import Splash from './content/pages/splash/Splash'
import Home from './content/pages/home/Home'
import Carplay from './content/carplay/Carplay'
import Cardata from './content/cardata/Cardata'



function App() {
  const versionNumber = "2.0.0"

  const [applicationSettings, setApplicationSettings] = useState(null)
  const [canbusSettings, setCanbusSettings] = useState(null)
  const [view, setView] = useState('Dashboard')

  const [phoneState, setPhoneState] = useState(false);
  const [carplayState, setCarplayState] = useState(false);

  return (
    <div className="container" style={{overflow:'hidden'}}>
    <Splash 
    versionNumber={versionNumber}
    />
    <Cardata/>
    {applicationSettings ? 
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
      </div> : <></>}
      <Home
        applicationSettings={applicationSettings}
        setApplicationSettings={setApplicationSettings}
        canbusSettings={canbusSettings}
        setCanbusSettings={setCanbusSettings}
        view={view}
        setView={setView}
        phoneState={phoneState}
        setPhoneState={setPhoneState}
        carplayState={carplayState}
        setCarplayState={setCarplayState}
        versionNumber={versionNumber}
      />
    </div>
  )
}

export default App
