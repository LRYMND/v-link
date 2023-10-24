import './App.css';

import { useEffect, useRef, useState } from "react";
import { ExtraConfig } from "../../main/Globals";
import Home from './pages/home/Home';
import Carplay from './components/Carplay'
import { IpcRendererEvent } from "electron";

// rm -rf node_modules/.vite; npm run dev


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  height: '95%',
  width: '95%',
  boxShadow: 24,
  display: "flex"
};

function App() {
  const [settings, setSettings] = useState<ExtraConfig | null>(null)
  const intialized = useRef(false)
  const intialized2 = useRef(false)
  const [receivingVideo, setReceivingVideo] = useState(false)
  const [commandCounter, setCommandCounter] = useState(0)
  const [keyCommand, setKeyCommand] = useState('')
  const [reverse, setReverse] = useState(false)
  const [key, setKey] = useState('')



  console.log("rendering")

  useEffect(() => {
    if(!intialized.current) {
      intialized.current = true
      window.api.settings((_, value: ExtraConfig) => {
        console.log("setting settings")
        setSettings(value)
      })
    }

  }, [window.api]);

  useEffect(() => {
    window.api.reverse((_: IpcRendererEvent, value: boolean) => {
      console.log("reverse", value)
      value ? setReverse(true) : setReverse(false)
    })
  }, [window.api]);


  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [settings]);


  const onKeyDown = (event: KeyboardEvent) => {
    console.log(event.code)
    if(Object.values(settings.bindings).includes(event.code)) {
      let action = Object.keys(settings.bindings).find(key =>
        settings.bindings[key] === event.code
      )
      if(action !== undefined) {
        setKeyCommand(action)
        setCommandCounter(prev => prev +1)
        if(action === 'selectDown') {
          console.log('select down')
          setTimeout(() => {
            setKeyCommand('selectUp')
            setCommandCounter(prev => prev +1)
          }, 200)
        }
      }
    }
  }

  useEffect(() => {
    if(!intialized2.current) {
      window.api.getSettings()
    }
  }, [window.api]);

  return (

    <div>
      {/*settings ? <Carplay  receivingVideo={receivingVideo} setReceivingVideo={setReceivingVideo} settings={settings} command={keyCommand} commandCounter={commandCounter}/> : null*/}
      <Home />
    </div>
  )
}

export default App

