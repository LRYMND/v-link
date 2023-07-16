const storage = require('electron-json-storage');

const User = require('./settings/user');
const Canbus = require('./settings/canbus');

const userSettings = new User();
const canbusSettings = new Canbus();


const getSettings = (obj, callback) => {
  storage.has(obj, (error, hasKey) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (!hasKey) {
      const defaultSettings = obj === 'user' ? userSettings.schema : canbusSettings.schema;
      storage.set(obj, defaultSettings, (error) => {
        if (error) {
          callback(error, null);
        } else {
          callback(null, defaultSettings);
        }
      });
    } else {
      storage.get(obj, (error, settings) => {
        if (error) {
          callback(error, null);
        } else {
          callback(null, settings);
        }
      });
    }
  });
};


const saveSettings = (newSettings) => {
  storage.set('user', newSettings, (error) => {
    if (error) {
      console.error('Error saving settings:', error);
    } else {
      console.log('Settings saved successfully.');
    }
  });
};


const resetSettings = (obj, callback) => {
  const defaultSettings = obj === 'user' ? userSettings.schema : canbusSettings.schema;
  storage.set(obj, defaultSettings, (error) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, defaultSettings);
    }
  });
};


module.exports = {
  getSettings,
  saveSettings,
  resetSettings
};