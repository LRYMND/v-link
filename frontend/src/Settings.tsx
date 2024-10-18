import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { APP, MMI, CAN, LIN, ADC, RTI } from './store/Store';

const modules = {
  app: APP,
  mmi: MMI,
  can: CAN,
  lin: LIN,
  adc: ADC,
  rti: RTI
};


const socket = {};

let loadedModules = 0;
const totalModules = Object.keys(modules).length;  


Object.keys(modules).forEach(module => {
  socket[module] = io(`ws://localhost:4001/${module}`);
});



export const Settings = () => {

  // Initialize all Zustand stores and map them to module names
  const store = Object.fromEntries(
    Object.entries(modules).map(([key, useStore]) => [key, useStore()])
  );
  //store.app.update({ modules: modules });
  //console.log(store.app.modules)

  //const store = useStores();

  //const [loadedModules, setLoadedModules] = useState(0);


  const [windowSize, setWindowSize] = useState(false);

  console.log("Rerender")

  /* Handle Window Resize */
  /*
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      store.app.update({ windowSize: { width: window.innerWidth, height: window.innerHeight } })
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  */



  /* Handle Content Resize */
  /*
  useEffect(() => {
    const handleResize = () => {
      if (initialized) {
        //console.log('Resize Logic')
        const topBar = store.app.settings.side_bars.topBarHeight.value
        const navBar = store.app.settings.side_bars.navBarHeight.value
        const config = (store.app.settings.side_bars.topBarAlwaysOn.value ? topBar : 0)

        const newContentSize = { width: store.app.settings.windowSize.width, height: (store.app.settings.windowSize.height - (topBar + navBar)) };
        const newCarplaySize = { width: store.app.settings.windowSize.width, height: store.app.settings.windowSize.height - config };

        updateStore({
          startedUp: true,
          contentSize: newContentSize,
          carplaySize: newCarplaySize,
        })
      }
    };

    handleResize();
  }, [windowSize, initialized])
  */


  /* Handle Text Resize */
  /*
  useEffect(() => {
    if (initialized) {
      const multiplier: useStore('app'].user.app.textSize.options = {
        'Small': .75,
        'Default': 1,
        'Large': 1.25,
      };

      updateStore({ textScale: multiplier[useStore('app'].user.app.textSize.value] })
    }
  }, [user, initialized])
  */


  /* Handle Interface Visibility */
  /*
  useEffect(() => {
    if (store.app.system.phoneState && (store.app.system.view === 'Carplay') && store.app != null) {
      store.app.update({ settings: { interface: { topBar: false, navBar: false } } })

      if (store.app.settings.side_bars.topBarAlwaysOn.value)
        store.app.update({ settings: { interface: { dashBar: true } } })
    }
    else {
      store.app.update({settings : { interface: { dashBar: false, topBar: true, navBar: true, content: true, carplay: false } } })
    }
  }, [store.app.system.view, store.app.system.phoneState, store.app.settings]);
  */




  // Wait for Settings
  useEffect(() => {
    const handleSettings = (module) => (data) => {
      console.log("handleSettings", data)
      store[module].update({ settings: data });

      loadedModules += 1

      if (loadedModules === totalModules) {
        console.log('All settings loaded successfully!');
        Object.keys(modules).forEach(module => {
          console.log(module, "settings:", store[module])
        });
        store['app'].update({ system: { initialized: true } })
        store['app'].update({ modules: modules })
      }
    };

    const handleState = (module) => (data) => {
      store[module].update({ system: { state: data } })
    }


    Object.keys(modules).forEach(module => {
      socket[module].on('state', handleState(module));
      socket[module].on('settings', handleSettings(module));
      
      socket[module].emit('ping');
      socket[module].emit('load');

    });

    return () => {

      Object.keys(modules).forEach(module => {
        socket[module].off('settings', handleSettings(module));
        socket[module].off('ping', handleState(module));
      });
    };
  }, []);

  return null;

};