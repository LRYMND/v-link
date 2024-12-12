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
//      v-link_id: "map:",                   // Identifier for V-Link app
//      req_id: req_id[0],                  // ID for the request message
//      rep_id: rep_id[0],                  // ID for the expected reply
//      action: command[3],                 // Type of operation
//      target: target_id[0],               // Target ECU
//      is_16bit: false,                    // 8Bit or 16Bit response value
//      refresh_rate: "high",               // Message interval ("low" || "high")
//      scale: '((value - 101.0) * 0.01)',  // Formula to scale the response
//      //UI parameter:
//      label: "Boost",                     // Label for V-Link app
//      max_value: 2,                       // Expected max. value for gauge setup
//      limit_start: 1.5,                   // Start of redline for gauge setup
//  },