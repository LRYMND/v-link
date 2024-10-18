import {
    useEffect,
    useMemo,
  } from 'react'
import { CANWorker, ADCWorker } from './worker/types'
import { DATA } from './../store/Store';


function Cardata () {

  const update = DATA((state) => state.update);

    
    const canWorker = useMemo(() => {
      const worker = new Worker(
        new URL('./worker/CAN.worker.ts', import.meta.url), {
          type : 'module'
        }
      ) as CANWorker
      return worker
    }, [])

    const adcWorker = useMemo(() => {
      const worker = new Worker(
        new URL('./worker/ADC.worker.ts', import.meta.url), {
          type : 'module'
        }
      ) as ADCWorker
      return worker
    }, [])
  
    useEffect(() => {
        canWorker.onmessage = (event) => {
          const { type, message } = event.data;
          const newData = { [type]: message };
          update(newData.message)
        };

        adcWorker.onmessage = (event) => {
          const { type, message } = event.data;
          const newData = { [type]: message };
          update(newData.message)
        };
    
        return () => {
          // Clean up the worker when the component is unmounted
          adcWorker.terminate();
          canWorker.terminate();
        };
      }, []);

    return null
  }
  
  export default Cardata
  