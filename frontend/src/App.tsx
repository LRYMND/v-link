import { Store } from './content/store/Store';

import Settings from './Settings'

import Splash from './content/Splash'
import Content from './content/Content'

import Carplay from './content/carplay/Carplay'
import Cardata from './content/cardata/Cardata'

import NavBar from './content/sidebars/NavBar';
import TopBar from './content/sidebars/TopBar';
import DashBar from './content/sidebars/DashBar';

import './App.css'

function App() {
  const store = Store((state) => state);

  return (
    <div style={{ overflow: 'hidden' }}>

      <Settings/>
      <Splash  />
      <Cardata />

      {store.startedUp ?
        <>
          {store.interface.dashBar && (  <DashBar/> )}

          {store.interface.topBar && ( <TopBar/> )}

          <Carplay/>

          {store.interface.content && ( <Content/> )}

          {store.interface.navBar && ( <NavBar/> )}
        </> : <></>}
    </div>
  )
}

export default App
