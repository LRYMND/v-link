import { useState, useEffect } from 'react'

import { ApplicationSettings, Store } from './store/Store';

import Settings from './Settings'

import Splash from './app/Splash'
import Content from './app/Content'

import Carplay from './carplay/Carplay'
import Cardata from './cardata/Cardata'

import NavBar from './app/sidebars/NavBar';
import TopBar from './app/sidebars/TopBar';
import DashBar from './app/sidebars/DashBar';

import './App.css'

function App() {
  const store = Store((state) => state);
  const startedUp = Store((state) => state.startedUp);
  const settings = Store((state) => state.applicationSettings);
  const [commandCounter, setCommandCounter] = useState(0)
  const [keyCommand, setKeyCommand] = useState('')

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [settings]);

  const onKeyDown = (event: KeyboardEvent) => {
    console.log(event.code)
    if (Object.values(settings!.app.keyBindings).includes(event.code)) {
      const action = Object.keys(settings!.app.keyBindings).find(key =>
        settings!.app.keyBindings[key] === event.code
      )
      if (action !== undefined) {
        setKeyCommand(action)
        setCommandCounter(prev => prev + 1)
        if (action === 'selectDown') {
          console.log('select down')
          setTimeout(() => {
            setKeyCommand('selectUp')
            setCommandCounter(prev => prev + 1)
          }, 200)
        }
      }
    }
  }

  return (
    <div style={{ overflow: 'hidden' }}>

      <Settings />
      <Splash />
      <Cardata />

      {startedUp ?
        <>
          {store.interface.dashBar && (<DashBar />)}

          {store.interface.topBar && (<TopBar />)}

          <Carplay commandCounter={commandCounter} command={keyCommand} />

          {store.interface.content && (<Content />)}

          {store.interface.navBar && (<NavBar />)}
        </> : <></>}
    </div>
  )
}

export default App
