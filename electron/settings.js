const storage = require('electron-json-storage');

const themeOptions = ["Green", "Red", "Blue", "White"]
const valueOptions = ["Intake", "Boost", "Coolant", "Voltage", "Lambda1", "Lambda2"]

const optionMap = {
    colorTheme: themeOptions,

    gauge_1: valueOptions,
    gauge_2: valueOptions,
    gauge_3: valueOptions,

    chart_1: valueOptions,
    chart_2: valueOptions,

    value_1: valueOptions,
    value_2: valueOptions,
    value_3: valueOptions,
};



class UserSettings {

    constructor() {
        this.schema = {

            //NEW
            carplay: {
                type: 'object',
                properties: {
                    label: {
                        default: 'Advanced Settings'
                    },
                    fps: {
                        type: 'integer', //min.10-max.60
                        default: 60,
                    },

                    dpi: {
                        type: 'integer', //min.80-max.800
                        default: 140,
                    },

                    height: {
                        type: 'integer',
                        default: 440,
                    },

                    width: {

                        type: 'integer',
                        default: 800,
                    },

                    lhd: {
                        type: 'integer',
                        // maximum: 1,
                        // minimum: 0,
                        default: 0,
                    },
                    
                    kiosk: {
                        type: 'boolean',
                        default: true,
                    },

                }
            },

            app: {
                type: 'object',
                properties: {
                    label: {
                        default: 'Application'
                    },

                    colorTheme: {
                        type: 'object',
                        properties: {
                            value: {
                                default: 'Green',
                                enum: themeOptions
                            },
                            label: {
                                default: 'Color Theme'
                            },
                        }
                    },

                    windowHeight: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'integer',
                                default: 800,
                            },
                            label: {
                                default: 'Window Height'
                            },
                        }
                    },

                    windowWidth: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'integer',
                                default: 480,
                            },
                            label: {
                                default: 'Window Width'
                            },
                        }
                    },
                }
            },

            dash_1: {
                type: 'object',
                properties: {
                    label: {
                        default: 'Dashboard Page 1'
                    },

                    gauge_1: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Intake',
                            },
                            label: {
                                type: 'string',
                                default: 'Gauge Left',
                            },
                        },
                    },

                    gauge_2: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Boost',
                            },
                            label: {
                                type: 'string',
                                default: 'Gauge Middle',
                            },
                        },
                    },

                    gauge_3: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Coolant',
                            },
                            label: {
                                type: 'string',
                                default: 'Gauge Right',
                            },
                        },
                    },

                    value_1: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Lambda1',
                            },
                            label: {
                                type: 'string',
                                default: 'Value Left',
                            },
                        },
                    },

                    value_2: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Lambda2',
                            },
                            label: {
                                type: 'string',
                                default: 'Value Middle',
                            },
                        },
                    },

                    value_3: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Voltage',
                            },
                            label: {
                                type: 'string',
                                default: 'Value Right',
                            },
                        },
                    },
                }
            },

            dash_2: {
                type: 'object',
                properties: {
                    label: {
                        default: 'Dashboard Page 2'
                    },

                    chart_1: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Lambda1',
                            },
                            label: {
                                type: 'string',
                                default: 'Chart Top',
                            },
                        },
                    },

                    chart_2: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Lambda2',
                            },
                            label: {
                                type: 'string',
                                default: 'Chart Bottom',
                            },
                        },
                    },

                    value_1: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Boost',
                            },
                            label: {
                                type: 'string',
                                default: 'Value Top',
                            },
                        },
                    },

                    value_2: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Intake',
                            },
                            label: {
                                type: 'string',
                                default: 'Value Middle',
                            },
                        },
                    },

                    value_3: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Coolant',
                            },
                            label: {
                                type: 'string',
                                default: 'Value Bottom',
                            },
                        },
                    },
                }
            },

            dash_bar: {
                type: 'object',
                properties: {
                    label: {
                        default: 'DashBar'
                    },

                    value_1: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Boost',
                            },
                            label: {
                                type: 'string',
                                default: 'Value Left',
                            },
                        },
                    },

                    value_2: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Intake',
                            },
                            label: {
                                type: 'string',
                                default: 'Value Middle',
                            },
                        },
                    },

                    value_3: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Coolant',
                            },
                            label: {
                                type: 'string',
                                default: 'Value Right',
                            },
                        },
                    },
                }
            },

            visibility: {
                type: 'object',
                properties: {
                    label: {
                        default: 'Show/Hide Elements'
                    },

                    showGauge_1: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'boolean',
                                default: true,
                            },
                            label: {
                                type: 'string',
                                default: 'Show Gauge #1',
                            },
                        },
                    },

                    showGauge_2: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'boolean',
                                default: true,
                            },
                            label: {
                                type: 'string',
                                default: 'Show Gauge #2',
                            },
                        },
                    },

                    showGauge_3: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'boolean',
                                default: true,
                            },
                            label: {
                                type: 'string',
                                default: 'Show Gauge #3',
                            },
                        },
                    },
                }
            },

            interface: {
                type: 'object',
                properties: {
                    label: {
                        default: 'Interface'
                    },

                    activateOSD: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'boolean',
                                default: true,
                            },
                            label: {
                                type: 'string',
                                default: 'Activate DashBar',
                            },
                        },
                    },

                    activateCAN: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'boolean',
                                default: true,
                            },
                            label: {
                                type: 'string',
                                default: 'CAN Interface',
                            },
                        },
                    },

                    activateMMI: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'boolean',
                                default: true,
                            },
                            label: {
                                type: 'string',
                                default: 'CarPlay Interface',
                            },
                        },
                    },
                }
            },

            dev: {
                type: 'object',
                properties: {
                    label: {
                        default: 'Interface'
                    },

                    versionNumber: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: '1.3.0',
                            },
                            label: {
                                type: 'string',
                                default: 'Activate DashBar',
                            },
                        },
                    },
                }
            },


        };

        this.saveSettingsToFile = () => {
            storage.set('settings', this.schema, (error) => {
                if (error) {
                    console.error('Error saving settings:', error);
                } else {
                    console.log('Settings saved successfully.');
                }
            });
        }


        this.getDefaultSettings = () => {
            const defaultSettings = {};
          
            const traverseSchema = (schema, settings) => {
              for (const key in schema) {
                if (schema[key].type === 'object') {
                  settings[key] = {};
                  traverseSchema(schema[key].properties, settings[key]);
                  if (optionMap.hasOwnProperty(key)) {
                    settings[key].options = optionMap[key];
                  }
                } else {
                  settings[key] = schema[key].default;
                }
              }
            };
          
            traverseSchema(this.schema, defaultSettings);
          
            return defaultSettings;
          };


        this.getTestSettings = () => {
            return new Promise((resolve, reject) => {
              // Check if a storage file exists
              storage.has('settings', (error, hasKey) => {
                if (error) {
                  reject(error);
                  return;
                }
          
                // If the storage file doesn't exist, create one with default values
                if (!hasKey) {
                  const defaultSettings = this.getDefaultSettings();
                  storage.set('settings', defaultSettings, (error) => {
                    if (error) {
                      reject(error);
                    } else {
                      resolve(defaultSettings);
                    }
                  });
                } else {
                  // If the storage file exists, read its contents and return them
                  storage.get('settings', (error, settings) => {
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

        this.saveTestSettings = (newSettings) => {
            storage.set('settings', newSettings, (error) => {
                if (error) {
                    console.error('Error saving settings:', error);
                } else {
                    console.log('Settings saved successfully.');
                }
            });
        };
    }
}

module.exports = UserSettings
