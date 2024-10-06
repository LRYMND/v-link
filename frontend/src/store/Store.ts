import { create } from 'zustand';
import { produce } from 'immer';


const useTestStore = create((set) => ({
  settings: {},
  updateSettings: (key, value) => {
    set((state) =>
      produce(state, (draft) => {
        draft.settings[key] = { ...draft.settings[key], ...value };
      })
    );
  },
}));


/*
const useTestStore = create((set) => ({
  settings: {},
  updateSettings: (key, value) => {
    set((state) =>
      produce(state, (draft) => {
        if (JSON.stringify(draft.settings[key]) !== JSON.stringify(value)) {
          draft.settings[key] = { ...draft.settings[key], ...value };
        }
      })
    );
  },
}));
*/

/*
const useTestStore = create((set) => ({
  settings: {},
  updateSettings: (key, value) => {
    set((state) => {
      if (JSON.stringify(state.settings[key]) !== JSON.stringify(value)) {
        return {
          settings: {
            ...state.settings,
            [key]: {
              ...state.settings[key], // Preserve existing key properties
              ...value, // Update key with new value(s)
            },
          },
        };
      }
      return state;
    });
  },
}));
*/

/*
const useTestStore = create((set) => ({
  settings: {},
  updateSettings: (key, value) => {
    console.log("oldValue: ", (state) => ({state}))
    console.log("newValue:", value)
    set((state) => ({
      settings: {
        ...state.settings,
        [key]: {
          ...state.settings[key], // Preserve existing key properties
          ...value, // Update key with new value(s)
        },
      },
    }));
  },
}));
*/

/* STORES */

const CarData = create((set) => ({
  carData: {},
  updateCarData: (newData) =>
    set((state) => ({ carData: { ...state.carData, ...newData } })),
}));

const ApplicationSettings = create((set) => ({
  applicationSettings: {},
  updateApplicationSettings: (newData) =>
    set((state) => ({ applicationSettings: { ...state.applicationSettings, ...newData } })),
}));

const SensorSettings = create((set) => ({
  sensorSettings: {},
  updateSensorSettings: (newData) =>
    set((state) => ({ sensorSettings: { ...state.sensorSettings, ...newData } })),
}));

const CarplaySettings = create((set) => ({
  kiosk: undefined,
  camera: undefined,
  microphone: undefined,
  piMost: undefined,
  canbus: undefined,
  bindings: undefined,
  most: undefined,
  canConfig: undefined,
  updateCarplaySettings: (newData) =>
    set((state) => ({ ...state, ...newData })),
}))

const Store = create((set) => ({
  version: '2.1.0',
  startedUp: false,
  view: undefined,
  windowSize: { width: undefined, height: undefined },
  contentSize: { width: undefined, height: undefined },
  carplaySize: { width: undefined, height: undefined },
  interface: { dashBar: false, topBar: false, navBar: false, content: false, carplay: false },
  wifiState: 'inactive',
  btState: 'inactive',
  phoneState: false,
  carplayState: false,
  streamState: false,
  canState: false,
  adcState: false,
  rtiState: false,
  textScale: 'Default',
  updateStore: (newData) =>
    set((state) => ({ ...state, ...newData })),
}));



export { CarData, ApplicationSettings, SensorSettings, Store, useTestStore };
