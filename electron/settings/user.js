class UserSettings {
    constructor() {
        this.schema = {
            version: "1.0",

            carplay: {
                label: 'Advanced Settings',
                fps: 60,    // 10-60
                dpi: 140,   // 80-800
                width: 800,
                height: 440,
                lhd: 0,     // 0-1
                kiosk: true,
            },


            app: {
                label: 'Application',
                colorTheme: {
                    value: 'Green',
                    label: 'Color Theme',
                    options: ["Green", "Red", "Blue", "White"],
                },
                windowWidth: {
                    value: 800,
                    label: 'Window Width',
                },
                windowHeight: {
                    value: 480,
                    label: 'Window Height',
                },
            },


            dash_1: {
                label: 'Dashboard Page 1',
                gauge_1: {
                    value: 'intake',
                    label: 'Gauge Left',
                },
                gauge_2: {
                    value: 'boost',
                    label: 'Gauge Middle',
                },
                gauge_3: {
                    value: 'coolant',
                    label: 'Gauge Right',
                },
                value_1: {
                    value: 'lambda1',
                    label: 'Value Left',
                },
                value_2: {
                    value: 'lambda2',
                    label: 'Value Middle',
                },
                value_3: {
                    value: 'voltage',
                    label: 'Value Right',
                },
            },


            dash_2: {
                label: 'Dashboard Page 2',
                chart_1: {
                    value: 'lambda1',
                    label: 'Chart Top',
                },
                chart_2: {
                    value: 'lambda2',
                    label: 'Chart Bottom',
                },
                value_1: {
                    value: 'boost',
                    label: 'Value Top',
                },
                value_2: {
                    value: 'intake',
                    label: 'Value Middle',
                },
                value_3: {
                    value: 'coolant',
                    label: 'Value Bottom',
                },
            },

            charts: {
                label: 'Chart Settings',
                chart_1_min: {
                    value: 0.8,
                    label: 'Chart 1 Min.',
                },
                chart_1_max: {
                    value: 1.2,
                    label: 'Chart 1 Max.',
                },
                chart_2_min: {
                    value: 0.0,
                    label: 'Chart 2 Min.',
                },
                chart_2_max: {
                    value: 2.0,
                    label: 'Chart 2 Max.',
                },
            },


            dash_bar: {
                label: 'DashBar',
                value_1: {
                    value: 'boost',
                    label: 'Value Left',
                },
                value_2: {
                    value: 'intake',
                    label: 'Value Middle',
                },
                value_3: {
                    value: 'coolant',
                    label: 'Value Right',
                },
            },


            visibility: {
                label: 'Show/Hide Elements',
                showGauge_1: {
                    value: true,
                    label: 'Show Gauge #1',
                },
                showGauge_2: {
                    value: true,
                    label: 'Show Gauge #2',
                },
                showGauge_3: {
                    value: true,
                    label: 'Show Gauge #3',
                },
            },


            interface: {
                label: 'Interface',
                activateOSD: {
                    value: true,
                    label: 'Activate DashBar',
                },
                activateCAN: {
                    value: true,
                    label: 'CAN Interface',
                },
                activateMMI: {
                    value: true,
                    label: 'CarPlay Interface',
                },
            },


            comfort: {
                label: 'Comfort',
                cruiseControl: {
                    value: false,
                    label: 'Show Advanced Settings',
                },
                openWindows: {
                    value: false,
                    label: 'Show Advanced Settings',
                },
                closeWindows: {
                    value: false,
                    label: 'Show Advanced Settings',
                },
            },


            lights: {
                label: 'Lights',
                headlights: {
                    value: false,
                    label: 'Activate Headlights',
                },
                sidelights: {
                    value: false,
                    label: 'Activate Sidelights',
                },
                foglights: {
                    value: false,
                    label: 'Activate Foglights',
                },
            },

            dev: {
                label: 'Dev',
                advancedSettings: {
                    value: false,
                    label: 'Show Advanced Settings',
                },
            },
        };
    }
}

module.exports = UserSettings;
