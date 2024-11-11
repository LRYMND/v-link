import { create } from 'zustand';


/* STORES */
const DATA = create((set) => ({
  data: {}, // Object to store live vehicle data
  update: (newData) =>
    set((state) => ({ data: { ...state.data, ...newData } })),
}));



const APP = create((set) => ({
  system: {
    version: '2.2.0',
    view: 'Carplay',

    initialized: false,
    startedUp: false,

    windowSize: {
      width: 800,
      height: 480 },
    contentSize: {
      width: 800,
      height: 480
    },
    carplaySize: {
      width: 800,
      height: 460
    },

    interface: {
      dashBar: true,
      topBar: true,
      navBar: true,
      content: true,
      carplay: false
    },

    wifiState: false,
    btState: false,
    
    phoneState: false,
    carplayState: false,
    streamState: false,

    canState: false,
    linState: false,
    adcState: false,
    rtiState: false,

    textScale: 'Default',
  },
  settings: {},
  modules: {},
  update: (newData) =>
    set((state) => ({
      ...state,
      system: { ...state.system, ...newData.system },
      settings: { ...state.settings, ...newData.settings },
      modules: { ...state.modules, ...newData.modules }
    })),
}));



const MMI = create((set) => ({
  system: {
    kiosk: undefined,
    camera: undefined,
    microphone: undefined,
    piMost: undefined,
    canbus: undefined,
    bindings: undefined,
    most: undefined,
    canConfig: undefined,
  },
  settings: {},
  update: (newData) =>
    set((state) => ({
      ...state,
      system: { ...state.system, ...newData.system },
      settings: { ...state.settings, ...newData.settings }
    })),
}))



const CAN = create((set) => ({
  system: {
    state: false
  },
  settings: {},
  update: (newData) =>
    set((state) => ({
      ...state,
      system: { ...state.system, ...newData.system },
      settings: { ...state.settings, ...newData.settings }
    })),
}));



const LIN = create((set) => ({
  system: {
    state: false
  },
  settings: {},
  update: (newData) =>
    set((state) => ({
      ...state,
      system: { ...state.system, ...newData.system },
      settings: { ...state.settings, ...newData.settings }
    })),
}));



const ADC = create((set) => ({
  system: {
    state: false
  },
  settings: {},
  update: (newData) =>
    set((state) => ({
      ...state,
      system: { ...state.system, ...newData.system },
      settings: { ...state.settings, ...newData.settings }
    })),
}));



const RTI = create((set) => ({
  system: {
    state: false
  },
  settings: {},
  update: (newData) =>
    set((state) => ({
      ...state,
      system: { ...state.system, ...newData.system },
      settings: { ...state.settings, ...newData.settings }
    })),
}));






export { DATA, APP, MMI, CAN, LIN, ADC, RTI };
