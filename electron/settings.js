const Store = require('electron-store')

class UserSettings {
    constructor() {
        this.schema = {

            //NEW
            app: {
                type: 'object',
                properties: {
                    colorTheme: {
                        default: 'Green',
                    },

                    windowHeight: {
                        type: 'integer',
                        default: 480,
                    },

                    windowWidth: {
                        type: 'integer',
                        default: 800,
                    },
                }
            },

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

            dash_1: {
                type: 'object',
                properties: {

                    gaugeLeft: {
                        type: 'object',
                        properties: {
                            value: {
                                type: 'integer',
                                default: 480,
                            },
                            label: {
                                type: 'string',
                                default: 'Gauge Left',
                            },
                        },
                    },

                    gaugeMiddle: {
                        type: 'integer',
                        default: 480,
                    },

                    gaugeRight: {
                        type: 'integer',
                        default: 480,
                    },

                    valueLeft: {
                        type: 'string',
                        default: 'Lambda1',
                    },
                    valueMiddle: {
                        type: 'string',
                        default: 'Lambda2',
                    },
                    valueRight: {
                        type: 'string',
                        default: 'Voltage',
                    },
                }
            },

            dash_2: {
                type: 'object',
                properties: {
                    chartTop: {
                        type: 'string',
                        default: 'Lambda1',
                    },
                    chartBottom: {
                        type: 'string',
                        default: 'Lambda2',
                    },

                    valueTop: {
                        type: 'string',
                        default: 'Intake',
                    },
                    valueMiddle: {
                        type: 'string',
                        default: 'Boost',
                    },
                    valueBottom: {
                        type: 'string',
                        default: 'Coolant',
                    },
                }
            },

            visibility: {
                type: 'object',
                properties: {
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
                }
            },

            interface: {
                type: 'object',
                properties: {
                    activateCAN: {
                        type: 'boolean',
                        default: true,
                    },
                    activateMMI: {
                        type: 'boolean',
                        default: true,
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
    }

    getMajorKeys() {
        return Object.keys(this.schema);
    }

    getSubKey(majorKey) {
        const majorKeySchema = this.schema[majorKey];
        if (majorKeySchema && majorKeySchema.type === 'object') {
            const subKeys = Object.keys(majorKeySchema.properties);
            const subKeyValues = subKeys.map((name) => ({
                name,
                value: this.store.get(`${majorKey}.${name}`, majorKeySchema.properties[name].default),
            }));
            return subKeyValues;
        }
        return [];
    }

    getAllSettings() {
        const allSettings = {};

        const addSettings = (obj, key, schema) => {
            if (schema && schema.type === 'object' && schema.properties) {
                obj[key] = {};

                Object.entries(schema.properties).forEach(([subKey, subSchema]) => {
                    addSettings(obj[key], subKey, subSchema);
                });
            } else {
                obj[key] = this.store.get(key, schema.default);
            }
        };

        Object.entries(this.schema).forEach(([key, schema]) => {
            addSettings(allSettings, key, schema);
        });

        return allSettings;
    }
}

module.exports = UserSettings