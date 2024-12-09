import { useState, useEffect } from 'react'

import { APP, MMI, KEY } from './store/Store';
import { Socket } from './socket/Socket'

import { shallow } from 'zustand/shallow'

import Splash from './app/Splash'
import Content from './app/Content'

import Carplay from './carplay/Carplay'
import Cardata from './cardata/Cardata'

import NavBar from './app/sidebars/NavBar';
import TopBar from './app/sidebars/TopBar';
import DashBar from './app/sidebars/DashBar';

import './App.css'


function App() {
  const mmi = MMI((state) => state);
  const key = KEY((state) => state);

  const system = APP((state) => state.system)

  const [receivingVideo, setReceivingVideo] = useState(false)
  const [commandCounter, setCommandCounter] = useState(0)
  const [keyCommand, setKeyCommand] = useState('')

  useEffect(() => {
    document.addEventListener('keydown', mmiKeyDown)
    return () => {
      document.removeEventListener('keydown', mmiKeyDown)
      console.log("return")
    }
  }, []);

  const mmiKeyDown = (event: KeyboardEvent) => {
    // Store last Keystroke in store to broadcast it
    key.setKeyStroke(event.code)

    // Check if a key for switching the pages was assigned
    if (system.switch) {

      // If user is not switching the page, send control to CarPlay
      if (event.code != system.switch) {
        if (Object.values(mmi!.bindings).includes(event.code)) {
          const action = Object.keys(mmi!.bindings).find(key =>
            mmi!.bindings[key] === event.code
          )
          //console.log(action)
          if (action !== undefined) {
            setKeyCommand(action)
            setCommandCounter(prev => prev + 1)
            if (action === 'selectDown') {
              console.log('Enter')
              setTimeout(() => {
                setKeyCommand('selectUp')
                setCommandCounter(prev => prev + 1)
              }, 200)
            }
          }
        }
      }
    }
  }

  return (
    <div style={{ overflow: 'hidden', background: 'var(--bgGradient1)', }}>
      <Socket />
      <Cardata />
      <Splash />

      {system.startedUp ?
        <>
          {system.interface.dashBar && (<DashBar />)}
          {system.interface.topBar && (<TopBar />)}

          <Carplay receivingVideo={receivingVideo} setReceivingVideo={setReceivingVideo} commandCounter={commandCounter} command={keyCommand} />
          <Content />

          {system.interface.navBar && (<NavBar />)}
        </> : <></>}
    </div>
  )
}

export default App
