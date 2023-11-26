import {
  useState,
} from 'react'

import './App.css'

import Home from './content/pages/home/Home'
import Carplay from './content/carplay/Carplay'

function App() {

  const [applicationSettings, setApplicationSettings] = useState(null)
  const [canbusSettings, setCanbusSettings] = useState(null)
  const [view, setView] = useState('Dashboard')

  const [phoneState, setPhoneState] = useState(false);
  const [carplayState, setCarplayState] = useState(false);


  return (
    <>
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
      />
    </>
  )
}

export default App
