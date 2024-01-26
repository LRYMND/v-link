import { create } from 'zustand';

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
  canState: false,
  adcState: false,
  textScale: 'Default',
  updateStore: (newData) =>
    set((state) => ({ ...state, ...newData })),
}));



export { CarData, ApplicationSettings, SensorSettings, Store };
