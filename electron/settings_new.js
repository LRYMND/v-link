const Store = require('electron-store')
const themeOptions = ["Green", "Red", "Blue", "White"]
const valueOptions = ["Intake", "Boost", "Lambda1"]

const optionMap = {
    colorTheme: themeOptions,
    windowHeight: [],
    gaugeLeft: valueOptions,
    gaugeRight: valueOptions,
    valueMiddle: valueOptions,
};



class UserSettings {

    constructor() {
        this.schema = {

            //NEW
            carplay: {
                type: 'object',
                properties: {
                    fps: {
                        type: 'integer', //min.10-max.60
                        default: 60,
                    },

                    dpi: {
                        type: 'integer', //min.80-max.800
                        default: 140,
                    },

                    kiosk: {
                        type: 'boolean',
                        default: true,
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
                }
            },

            app: {
                type: 'object',
                properties: {
                    label: {
                        default: 'Application Settings'
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

                    gaugeLeft: {
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

                    gaugeMiddle: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Boost',
                            },
                            label: {
                                type: 'string',
                                default: 'Gauge Left',
                            },
                        },
                    },

                    gaugeRight: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Coolant',
                            },
                            label: {
                                type: 'string',
                                default: 'Gauge Left',
                            },
                        },
                    },

                    valueLeft: {
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

                    valueMiddle: {
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

                    valueRight: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'voltage',
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

                    chartTop: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Lambda1',
                            },
                            label: {
                                type: 'string',
                                default: 'Gauge Left',
                            },
                        },
                    },

                    chartBottom: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'string',
                                default: 'Lambda2',
                            },
                            label: {
                                type: 'string',
                                default: 'Gauge Left',
                            },
                        },
                    },

                    valueTop: {
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

                    valueMiddle: {
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

                    valueBottom: {
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

            visibility: {
                type: 'object',
                properties: {
                    label: {
                        default: 'Show/Hide Elements'
                    },

                    showGaugeIntake: {
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

                    showGaugeBoost: {
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

                    showGaugeCoolant: {
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

                    activateOSD: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'boolean',
                                default: true,
                            },
                            label: {
                                type: 'string',
                                default: 'Activate OSD',
                            },
                        },
                    },
                }
            },

            interface: {
                type: 'object',
                properties: {
                    label: {
                        default: 'Interface Options'
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
        };

        this.store = new Store({ schema: this.schema })

        this.getAllSettings = () => {
            const allSettings = {};
          
            function copyObject(obj, newObj) {
                for (const [key, value] of Object.entries(obj)) {
                  if (value && typeof value === 'object' && !Array.isArray(value)) {
                    newObj[key] = {};
                    if ('properties' in value) {
                      newObj[key].properties = {};
                      copyObject(value.properties, newObj[key].properties);
                    }
                    if ('default' in value) {
                      newObj[key].default = value.default;
                    }
                  } else {
                    newObj[key] = value;
                  }
                }
              }
          
            copyObject(this.schema, allSettings);
          
            // Add options to the allSettings object
            function addOptions(obj, optionMap) {
              for (const key of Object.keys(optionMap)) {
                if (key in obj && Array.isArray(optionMap[key])) {
                  obj[key].properties.options = optionMap[key];
                }
              }
            }
            
            addOptions(allSettings.app.properties, optionMap);
          
            return allSettings;
          };

    }
}

module.exports = UserSettings
