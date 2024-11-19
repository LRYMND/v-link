import { create } from 'zustand';
import { Stream } from "socketmost/dist/modules/Messages";
import { DongleConfig } from 'node-carplay/node'
/*
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


const DEFAULT_BINDINGS = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  selectDown: 'Space',
  back: 'Backspace',
  down: 'ArrowDown',
  home: 'KeyH',
  play: 'KeyP',
  pause: 'KeyO',
  next: 'KeyM',
  prev: 'KeyN'
}

const EXTRA_CONFIG = {
  ...DEFAULT_CONFIG,
  kiosk: true,
  camera: '',
  microphone: '',
  piMost: false,
  canbus: false,
  bindings: DEFAULT_BINDINGS,
  most: {},
  canConfig: {}
}
*/
// Initialize store with default values (like EXTRA_CONFIG in index.ts)
const MMI = create<MMIStore>((set) => ({
  settings: "test", //EXTRA_CONFIG,
  saveSettings: (settings) => {
    // Here, we ensure all settings are properly merged before saving
    const mergedSettings: MMIConfig = {
      //...DEFAULT_CONFIG,
      ...settings, // Merge incoming settings with defaults
      bindings: settings.bindings || DEFAULT_BINDINGS, // Ensure bindings are set
    };

    set({ settings: mergedSettings });
    // socket.emit('saveSettings', mergedSettings); // Optionally send updated settings back to the server
  },
  getSettings: () => {
    // Simulate fetching settings from a backend or service
    // socket.emit('getSettings'); // Fetch settings from server if applicable
  },
  stream: (stream) => {
    // Handle streaming data if applicable
    // socket.emit('stream', stream);
  },
}));



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

/*
interface MMI {
  settings: null | ExtraConfig,
  saveSettings: (settings: ExtraConfig) => void
  getSettings: () => void
  stream: (stream: Stream) => void
}
  */

/*
export const useCarplayStore = create<MMI>()((set) =>({
  settings: null,
  saveSettings: (settings) => {
    set(() => ({settings: settings}))
    //socket.emit('saveSettings', settings)
  },
  getSettings: () => {
    //socket.emit('getSettings')
  },
  stream: (stream) => {
    //socket.emit('stream', stream)
  }
}))
*/

/*
const MMI = create((set) => ({
  settings: null as ExtraConfig | null,
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
*/




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
