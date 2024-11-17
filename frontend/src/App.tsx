import { useState, useEffect } from 'react'

import { APP, MMI } from './store/Store';
import { Settings } from './Settings'

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
  const app = APP((state) => state.system, shallow)
  const mmi = MMI((state) => state.settings, shallow)

  const [commandCounter, setCommandCounter] = useState(0)
  const [keyCommand, setKeyCommand] = useState('')

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, []);

  const onKeyDown = (event: KeyboardEvent) => {
    if (mmi != null) {
      console.log(event.code)
      console.log(mmi.keyBindings)
      if (Object.values(mmi!.keyBindings).includes(event.code)) {
        const action = Object.keys(mmi!.keyBindings).find(key =>
          mmi!.keyBindings[key] === event.code
        )
        console.log(action)
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
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      <Settings />
      <Cardata />
      <Splash />

      {app.initialized ?
        <>
          {app.interface.dashBar && (<DashBar />)}
          {app.interface.topBar && (<TopBar />)}


          <Carplay commandCounter={commandCounter} command={keyCommand} />

          {app.interface.content && (<Content />)}
          {app.interface.navBar && (<NavBar />)}
        </> : <></>}
    </div>
  )
}

export default App
