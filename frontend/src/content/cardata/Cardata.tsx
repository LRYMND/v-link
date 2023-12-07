import {
    useEffect,
    useMemo,
  } from 'react'
import { CarDataWorker } from './worker/types'
import CarDataStore from './store/Datastore'


function Cardata () {
    
    const cardataWorker = useMemo(() => {
      const worker = new Worker(
        new URL('./worker/CarData.worker.ts', import.meta.url), {
          type : 'module'
        }
      ) as CarDataWorker
      return worker
    }, [])
  
    useEffect(() => {
        cardataWorker.onmessage = (event) => {
          const { type, message } = event.data;
          const newData = { [type]: message };
          CarDataStore.getState().updateData(message);
    
          // Log the current state after updating
          //console.log('Current CarDataStore state:', CarDataStore.getState().carData);
        };
    
        return () => {
          // Clean up the worker when the component is unmounted
          cardataWorker.terminate();
        };
      }, []);

    return null
  }
  
  export default Cardata
  