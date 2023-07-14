const storage = require('electron-json-storage');

const User = require('./settings/user');
const Canbus = require('./settings/canbus');


const userSettings = new User();
const canbusSettings = new Canbus();


const getDefaultSettings = (schema) => {
    const traverseSchema = (schema) => {
      const settings = {};
  
      for (const key in schema) {
        if (schema[key].type === 'object') {
          settings[key] = traverseSchema(schema[key].properties);
        } else {
          settings[key] = schema[key].default;
        }
      }
  
      return settings;
    };
  
    return traverseSchema(schema);
  };

const getSettings = (obj) => {
    return new Promise((resolve, reject) => {
      storage.has(obj, (error, hasKey) => {
        if (error) {
          reject(error);
          return;
        }
        
  
        if (!hasKey) {
            storage.set(obj, obj === 'user' ? userSettings.schema : canbusSettings.schema, (error) => {
                if (error) {
                  reject(error);
                } else {
                  resolve({});
                }
              });
        } else {
          storage.get(obj, (error, settings) => {
            if (error) {
              reject(error);
            } else {
              resolve(settings);
            }
          });
        }
      });
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

module.exports = {
    getSettings,
    saveSettings
};