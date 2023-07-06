const Store = require('electron-store')
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
                        default: 'Interface Options'
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




            //OLD
            //APP SETTINGS
            fps: {
                type: 'integer', //min.10-max.60
                default: 60,
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
            dpi: {
                type: 'integer',
                // maximum: 800,
                // minimum: 80,
                default: 140,
            },
            windowHeight: {
                type: 'integer',
                default: 480,
            },
            windowWidth: {
                type: 'integer',
                default: 800,
            },
            lhd: {
                type: 'integer',
                // maximum: 1,
                // minimum: 0,
                default: 0,
            },

            //COLOR SETTINGS
            colorTheme: {
                default: 'Green',
            },

            //GAUGE VALUES
            gaugeLeft: {
                type: 'string',
                default: 'Intake',
            },
            gaugeMiddle: {
                type: 'string',
                default: 'Boost',
            },
            gaugeRight: {
                type: 'string',
                default: 'Coolant',
            },

            //CHART VALUES
            chartTop: {
                type: 'string',
                default: 'Lambda1',
            },
            chartBottom: {
                type: 'string',
                default: 'Lambda2',
            },

            //LABEL VALUES
            valueLeft_1: {
                type: 'string',
                default: 'Lambda1',
            },
            valueMiddle_1: {
                type: 'string',
                default: 'Lambda2',
            },
            valueRight_1: {
                type: 'string',
                default: 'Voltage',
            },
            valueTop_2: {
                type: 'string',
                default: 'Intake',
            },
            valueMiddle_2: {
                type: 'string',
                default: 'Boost',
            },
            valueBottom_2: {
                type: 'string',
                default: 'Coolant',
            },

            //TOGGLE ELEMENTS
            showGaugeBoost: {
                type: 'boolean',
                default: true,
            },
            showGaugeIntake: {
                type: 'boolean',
                default: true,
            },
            showGaugeCoolant: {
                type: 'boolean',
                default: true,
            },
            activateOSD: {
                type: 'boolean',
                default: true,
            },

            //INTERFACE SETTINGS
            activateCAN: {
                type: 'boolean',
                default: true,
            },
            activateMMI: {
                type: 'boolean',
                default: true,
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
              for (const [key, options] of Object.entries(optionMap)) {
                if (key in obj && Array.isArray(options)) {
                  if (!('properties' in obj[key])) {
                    obj[key] = { properties: {} };
                  }
                  obj[key].properties.options = options;
                }
              }
          
              for (const [, value] of Object.entries(obj)) {
                if (value && typeof value === 'object' && !Array.isArray(value) && 'properties' in value) {
                  addOptions(value.properties, optionMap);
                }
              }
            }
          
            addOptions(allSettings, optionMap);
          
            return allSettings;
          };
    }
}

module.exports = UserSettings
