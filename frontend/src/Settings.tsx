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

const system = io('ws://localhost:4001/sys');
system.emit("systemTask", "rti");


Object.keys(modules).forEach(module => {
  socket[module] = io(`ws://localhost:4001/${module}`);
});

export const Settings = () => {

  // Initialize all Zustand stores and map them to module names
  const store = Object.fromEntries(
    Object.entries(modules).map(([key, useStore]) => [key, useStore()])
  );

  const totalModules = Object.keys(modules).length;
  const [loadedModules, setLoadedModules] = useState(0)

  /* Handle Window Resize */
  useEffect(() => {
    const handleResize = () => {
      if (store['app'].system.initialized) {
        const topBar = store['app'].settings.side_bars.topBarHeight.value
        const navBar = store['app'].settings.side_bars.navBarHeight.value
        const config = (store['app'].settings.side_bars.dashBar.value ? topBar : 0)

        const newContentSize = { width: window.innerWidth, height: (window.innerHeight - (topBar + navBar)) };
        const newCarplaySize = { width: window.innerWidth, height: (window.innerHeight - config) };

        store['app'].update({
          system: {
            startedUp: true,
            contentSize: newContentSize,
            carplaySize: newCarplaySize,
            windowSize: { width: window.innerWidth, height: window.innerWidth },
          }
        })
      };
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [store['app'].system.initialized]);


  /* Handle Content Resize */
  /*
  useEffect(() => {
    const handleResize = () => {
      if (store['app'].system.initialized) {
        //console.log('Resize Logic')
        const topBar = store['app'].settings.side_bars.topBarHeight.value
        const navBar = store['app'].settings.side_bars.navBarHeight.value
        const config = (store['app'].settings.side_bars.dashBar.value ? topBar : 0)

        const newContentSize = { width: store['app'].system.windowSize.width, height: (store['app'].system.windowSize.height - (topBar + navBar)) };
        const newCarplaySize = { width: store['app'].system.windowSize.width, height: store['app'].system.windowSize.height - config };

        store['app'].update({system: {
          startedUp: true,
          contentSize: newContentSize,
          carplaySize: newCarplaySize,
        }})
      }
    };

    handleResize();
  }, [store['app'].system.initialized])
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


  /* Handle Interface Visibility */
  useEffect(() => {
    if (store.app.system.phoneState && (store.app.system.view === 'Carplay') && store.app != null) {
      store.app.update({ system: { interface: { topBar: false, navBar: false } } })
      if (store.app.settings.side_bars.dashBar.value)
        store.app.update({ system: { interface: { dashBar: true } } })
    } else {
      store['app'].update({ system: { interface: { dashBar: false, topBar: true, navBar: true, content: true, carplay: false } } })
    }
  }, [store['app'].system.view, store['app'].system.phoneState]);


  /* Initialize App */
  useEffect(() => {
    if (loadedModules === totalModules) {
      store['app'].update({ modules: modules })
    }

    if (Object.entries(store['app'].modules).length > 0 && !store['app'].system.initialized) {
      console.log('All settings loaded successfully!');
      Object.keys(modules).forEach(module => {
        console.log(module, "settings:", store[module])
      });
      store['app'].update({ system: { initialized: true } })
    }
  }, [loadedModules], [store['app'].modules])


  /* Wait for Settings */
  useEffect(() => {    
    const handleSettings = (module) => (data) => {
      store[module].update({ settings: data });
      setLoadedModules(current => current + 1)
    };

    const handleState = (module) => (data) => {
      store['app'].update({system: { [module + "State"] :data}})
      console.log("handling state, ", module, data)
      //store[module].update({ system: { state: data } })
    }


    Object.keys(modules).forEach(module => {
      if(module != 'mmi') {
        socket[module].on('state', handleState(module));
        socket[module].emit('ping');
      }

      socket[module].on('settings', handleSettings(module));
      socket[module].emit('load');
      //socket[module].emit('status');

    });

    return () => {

      Object.keys(modules).forEach(module => {
        socket[module].off('settings', handleSettings(module));
        socket[module].off('state', handleState(module));
      });
    };
  }, []);

  return null;

};