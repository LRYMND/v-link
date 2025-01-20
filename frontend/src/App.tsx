import { useState, useEffect, useRef } from 'react'

import { theme } from './theme/Theme';
import styled, { ThemeProvider } from 'styled-components';


import { APP, MMI, KEY } from './store/Store';
import { Socket } from './socket/Socket'

import Splash from './app/Splash'
import Content from './app/Content'

import Carplay from './carplay/Carplay'
import Cardata from './cardata/Cardata'
import TopBar from './app/sidebars/TopBar';

import './App.css'
import './theme/fonts.module.css';

const AppContainer = styled.div`
  position: absolute;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #0D0D0D, #1C1C1C);
`;

function App() {
  const mmi = MMI((state) => state);
  const key = KEY((state) => state);
  const app = APP((state) => state)

  const system = app.system

  const [commandCounter, setCommandCounter] = useState(0)
  const [keyCommand, setKeyCommand] = useState('')

  useEffect(() => {
    console.log(system)
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

  // Dimensions of the container
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false)
  /* Observe container resizing and update dimensions. */
  useEffect(() => {
    const handleResize = () => {
      console.log(containerRef.current.offsetWidth, containerRef.current.offsetHeight)
      app.update({system : { carplaySize: {
        width: containerRef.current.offsetWidth,
        height: app.system.carplay.fullscreen ? containerRef.current.offsetHeight : containerRef.current.offsetHeight - 20
      }}})
      setReady(true)
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <AppContainer ref={containerRef}>
      <Socket />
      <Cardata />
      <Splash />

      {system.startedUp ? (
        <ThemeProvider theme={theme}>

          {<Carplay
            commandCounter={commandCounter}
            command={keyCommand}
          />}
          {<Content />}
        </ThemeProvider>
      ) : (
        <></>
      )}
    </AppContainer>
  )
}

export default App
