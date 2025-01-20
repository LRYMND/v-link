import { create } from 'zustand';
/*
import { Stream } from "socketmost/dist/modules/Messages";
import { DongleConfig } from 'node-carplay/node'

export enum HandDriveType {
  LHD = 0,
  RHD = 1,
}

export type PhoneTypeConfig = {
  frameInterval: number | null
}

const DEFAULT_CONFIG = {
  width: 800,
  height: 640,
  fps: 20,
  dpi: 160,
  format: 5,
  iBoxVersion: 2,
  phoneWorkMode: 2,
  packetMax: 49152,
  boxName: 'nodePlay',
  nightMode: false,
  hand: HandDriveType.LHD,
  mediaDelay: 300,
  audioTransferMode: false,
  wifiType: '5ghz',
  micType: 'os',
  phoneConfig: {
    [PhoneType.CarPlay]: {
      frameInterval: 5000,
    },
    [PhoneType.AndroidAuto]: {
      frameInterval: null,
    },
  },
}
*/


const DEFAULT_BINDINGS = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  selectDown: 'Space',
  back: 'Backspace',
  down: 'ArrowDown',
  home: 'KeyH',
  play: 'KeyP',
  pause: 'KeyS',
  next: 'KeyN',
  prev: 'KeyV'
}

const EXTRA_CONFIG = {
  //...DEFAULT_CONFIG,
  kiosk: true,
  delay: 300,
  fps: 60,
  camera: '',
  microphone: '',
  piMost: false,
  canbus: false,
  bindings: DEFAULT_BINDINGS,
  most: {},
  canConfig: {}
}

const MMI = create<MMIStore>((set) => ({
  bindings: DEFAULT_BINDINGS,
  config: EXTRA_CONFIG,
  saveSettings: (settings) => {
    const mergedSettings: MMIConfig = {
      //...DEFAULT_CONFIG,
      ...settings,
      bindings: settings.mmi_bindings || DEFAULT_BINDINGS,
    };
    set({ settings: mergedSettings });
  },
  getSettings: () => {
  },
  stream: (stream) => {
  },
}));



const DATA = create((set) => ({
  data: {}, // Object to store live vehicle data
  update: (newData) =>
    set((state) => ({ data: { ...state.data, ...newData } })),
}));



const APP = create((set) => ({
  system: {
    version: '2.2.1',
    view: '',
    switch: 'ArrowUp',
    lastKey: '',

    settingPage: 1,
    modal: false,

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

    carplay: {
      user: false,
      dongle: false,
      phone: false,
      stream: false,
      fullscreen: false,
    },

    interface: {
      dashBar: true,
      topBar: true,
      navBar: true,
      sideBar: true,
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

    textScale: 1,
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


// Store to easily broadcast Keystrokes from App.tsx
const KEY = create((set) => ({
  keyStroke: "",
  setKeyStroke: (key) => {
    set({ keyStroke: key });
    setTimeout(() => set({ keyStroke: "" }), 0);
  },
}));





export { DATA, APP, MMI, CAN, LIN, ADC, RTI, KEY };
