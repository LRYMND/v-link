import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  APP, 
  APP, 
  MMI, 
  CAN, 
  LIN, 
  ADC, 
  RTI 
} from './store/Store';

// Mapping modules to namespaces and Zustand stores
const STORES = {
  sys: { namespace: '/sys', userSettings: APP },
  app: { namespace: '/app', userSettings: APP },
  mmi: { namespace: '/can', userSettings: MMI },
  can: { namespace: '/can', userSettings: CAN },
  lin: { namespace: '/lin', userSettings: LIN },
  adc: { namespace: '/adc', userSettings: ADC },
  rti: { namespace: '/rti', userSettings: RTI },
};

const socketInstances = {};

const useSettings = (module) => {
  const { namespace, userSettings } = STORES[module];

  // Create a socket connection for the specified namespace if it doesn't exist
  if (!socketInstances[module]) {
    socketInstances[module] = io(namespace);
  }
  const socket = socketInstances[module];

  // Access Zustand userSettings state and update function
  const settings = userSettings((state) => state); // Get all settings
  const updateSetting = userSettings((state) => state.updateSettings); // Get update function

  // Check if updateSetting is a function
  if (typeof updateSetting !== 'function') {
    console.error(`updateSetting is not a function for module: ${module}`);
    return { settings: null, saveSetting: () => {} };
  }

  useEffect(() => {
    // Function to handle incoming settings from socket
    const handleSettings = (receivedSettings) => {
      userSettings.setState({ ...receivedSettings }); // Assuming receivedSettings is formatted properly
      console.log(`Loaded settings for ${module}:`, receivedSettings); // Log loaded settings
    };

    // Listen for incoming settings updates
    socket.on('setting', handleSettings);
    socket.emit('conf', 'request');

    // Listen for status updates
    const handleStatusUpdate = (statusData) => {
      console.log(`Status update for ${module}:`, statusData); // Log status updates
    };
    
    socket.on('status', handleStatusUpdate); // Add status listener

    return () => {
      socket.off('setting', handleSettings);
      socket.off('status', handleStatusUpdate); // Clean up listener on unmount
    };
  }, [module, socket, userSettings]);

  // Function to save settings using socket
  const saveSetting = (newData) => {
    updateSetting(newData); // Call the update function with new data
    socket.emit('saveSetting', newData); // Emit saveSetting event with new data
  };

  return { settings, saveSetting };
};

export default useSettings;
