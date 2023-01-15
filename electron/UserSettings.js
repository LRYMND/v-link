const Store = require('electron-store')

class UserSettings {
    constructor() {
         this.schema = {
            colorTheme: {
                default: "Green"
            },
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
            activateCC: {
                type: 'boolean',
                default: false,
            },
            activateCAN: {
                type: 'boolean',
                default: true,
            },
            activateMMI: {
                type: 'boolean',
                default: true,
            },

            fps: {
                type: 'integer',
                // maximum: 60,
                // minimum: 10,
                default: 30
            },
            kiosk: {
                type: 'boolean',
                default: true
            },
            height: {
                type: 'integer',
                default: 480
            },
            width: {
                type: 'integer',
                default: 800
            },
            lhd: {
                type: 'integer',
                // maximum: 1,
                // minimum: 0,
                default: 0
            },
            dpi: {
                type: 'integer',
                // maximum: 800,
                // minimum: 80,
                default: 240
            }
        }

        this.store = new Store({schema: this.schema})
    }
}

module.exports = UserSettings