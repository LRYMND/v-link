//////////////////////////////////////////////////////////////////////////////////////////
/*                                                                                      */
/*  Message Format:                                                                     */
/*  000FFFFE FF FF FF FF FF FF FF FF                                                    */
/*     |     |  |  |  |  |  |  '--'---- Padding                                         */
/*     |     |  |  |  |  |  '---------- Number of responses expected (query only)       */
/*     |     |  |  |  |  |                                                              */
/*     |     |  |  |  '--'------------- Parameter                                       */
/*     |     |  |  '------------------- Command                                         */
/*     |     |  '---------------------- Target ECU address                              */
/*     |     '------------------------- Message-length (always C8 + data byte length)   */
/*     '------------------------------- Module ID                                       */
/*                                                                                      */
//////////////////////////////////////////////////////////////////////////////////////////


//  Template:
//
//  boost: {
//      //CAN-Bus parameter:
//      parameter: ['12', '9D'],            // Request parameter
//      rtvi_id: "map:",                    // Identifier for rtvi app
//      req_id: req_id[0],                  // ID for the request message
//      rep_id: rep_id[0],                  // ID for the expected reply
//      action: command[3],                 // Type of operation
//      target: target_id[0],               // Target ECU
//      is_16bit: false,                    // 8Bit or 16Bit response value
//      refresh_rate: "high",               // Message interval ("low" || "high")
//      scale: '((value - 101.0) * 0.01)',  // Formula to scale the response
//      //UI parameter:
//      label: "Boost",                     // Label for rtvi app
//      max_value: 2,                       // Expected max. value for gauge setup
//      limit_start: 1.5,                   // Start of redline for gauge setup
//  },



const command = [
    '0xA1', // [00] No Operation Performed (keep alive)
    '0xA3', // [01] Security Access Mode
    '0xA5', // [02] Read Current Data By Offset
    '0xA6', // [03] Read Current Data By Identifier
    '0xA7', // [04] Read Current Data By Address
    '0xA8', // [05] Set Data Transmission
    '0xA9', // [06] Stop Data Transmission
    '0xAA', // [07] Dynamically Define Record
    '0xAB', // [08] Read Freeze Frame Data By Offset
    '0xAC', // [09] Read Freeze Frame
    '0xAD', // [10] Read Freeze Frame By DTC
    '0xAE', // [11] Read DTC
    '0xAF', // [12] Clear DTC

    '0xB0', // [13] Input Output Control By Offset
    '0xB1', // [14] Input Output Control By Identifier
    '0xB2', // [15] Control Routine By Offset
    '0xB4', // [16] Define Read Write ECU data
    '0xB8', // [17] Write Data Block By Offset
    '0xB9', // [18] Read Data Block By Offset
    '0xBA', // [19] Write Data Block By Address
    '0xBB', // [20] Read Data Block By Address
]

const req_id = [
    "0x000FFFFE",   // [00] Diagnostic Request
]

const rep_id = [
    "0x00400021",   // [00] Diagnostic Reply
]

const target_id = [
    "0x7A",           // [00] ECM ID
]

class CanbusSettings {

    constructor() {
        this.schema = {
            version: "1.0",
            timing: {
                refresh_rate: 0.02,
                interval: 50,
            },

            messages: {
                boost: {
                    //CAN-Bus parameter:
                    parameter: ['0x12', '0x9D'],
                    rtvi_id: "map:",
                    req_id: req_id[0],
                    rep_id: rep_id[0],
                    action: command[3],
                    target: target_id[0],
                    is_16bit: false,
                    refresh_rate: "high",
                    scale: '((value - 101.0) * 0.01)',
                    //UI parameter:
                    label: "Boost",
                    unit: "Bar",
                    min_value: 0,
                    max_value: 2,
                    limit_start: 1.5,
                },

                intake: {
                    //CAN-Bus parameter:
                    parameter: ['0x10', '0xCE'],
                    rtvi_id: "iat:",
                    req_id: req_id[0],
                    rep_id: rep_id[0],
                    action: command[3],
                    target: target_id[0],
                    is_16bit: false,
                    refresh_rate: "low",
                    scale: '((value * 0.75) - 47.0)',
                    //UI parameter:
                    label: "Intake",
                    unit: "°C",
                    min_value: 0,
                    max_value: 90,
                    limit_start: 60,
                },

                coolant: {
                    //CAN-Bus parameter:
                    parameter: ['0x10', '0xD8'],
                    rtvi_id: "col:",
                    req_id: req_id[0],
                    rep_id: rep_id[0],
                    action: command[3],
                    target: target_id[0],
                    is_16bit: false,
                    refresh_rate: "low",
                    scale: '((value * 0.75) - 47.0)',
                    //UI parameter:
                    label: "Coolant",
                    unit: "°C",
                    min_value: 0,
                    max_value: 150,
                    limit_start: 100,
                },

                voltage: {
                    //CAN-Bus parameter:
                    parameter: ['0x10', '0x0A'],
                    rtvi_id: "vol:",
                    req_id: req_id[0],
                    rep_id: rep_id[0],
                    action: command[3],
                    target: target_id[0],
                    is_16bit: false,
                    refresh_rate: "low",
                    scale: '(value * 0.094238)',
                    //UI parameter:
                    label: "Voltage",
                    unit: "V",
                    min_value: 0,
                    max_value: 16,
                    limit_start: 16,
                },

                lambda1: {
                    //CAN-Bus parameter:
                    parameter: ['0x10', '0x34'],
                    rtvi_id: "ld1:",
                    req_id: req_id[0],
                    rep_id: rep_id[0],
                    action: command[3],
                    target: target_id[0],
                    is_16bit: true,
                    refresh_rate: "high",
                    scale: '((value * 16.0) / 65536.0)',
                    //UI parameter:
                    label: "Lambda 1",
                    unit: "",
                    min_value: 0,
                    max_value: 2,
                    limit_start: 2,
                },

                lambda2: {
                    //CAN-Bus parameter:
                    parameter: ['0x10', '0x2C'],
                    rtvi_id: "ld2:",
                    req_id: req_id[0],
                    rep_id: rep_id[0],
                    action: command[3],
                    target: target_id[0],
                    is_16bit: false,
                    refresh_rate: "low",
                    scale: '(value * (1.33 / 255.0))',
                    //UI parameter:
                    label: "Lambda 2",
                    unit: "V",
                    min_value: 0,
                    max_value: 2,
                    limit_start: 2,
                }
            }
        }
    }
}

module.exports = CanbusSettings;
