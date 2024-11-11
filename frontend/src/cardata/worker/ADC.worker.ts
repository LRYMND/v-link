import { io } from "socket.io-client";

let settings;

// Connect to the adc namespace to receive continuous data stream
const adcChannel = io("ws://localhost:4001/adc");

// Function to handle incoming adc settings
const handlesensorSettings = (data) => {
    settings = data.sensors;
    adcChannel.connect();
};

// Function to update car data
const update = (data) => {
    const updatedData = {};

    if (settings && data != null) {
        Object.keys(settings).forEach((key) => {
            const message = settings[key];
            const vlinkId = message.vlink_id;
            const regex = new RegExp(vlinkId, 'g');

            if (regex.test(data)) {
                const value = data.replace(regex, "");
                updatedData[key] = Number(value).toFixed(2);
            }
        });
    }
    return updatedData;
};

// Function to post updated car data to the main thread
const postCarDataToMain = (data) => {
    const message = {
        type: 'message',
        message: data
      };
    postMessage(message);
};

// Listen for adc settings
adcChannel.on("settings", handlesensorSettings);

// Listen for continuous data stream from adc namespace
adcChannel.on("data", (data) => {
    data = update(data);
    postCarDataToMain(data);
});

// Send a request for adc settings
adcChannel.emit("load");



onmessage = async (event: MessageEvent<Command>) => {
    switch (event.data.type) {
        case 'hello':
            postMessage("Webworker says hi?")
            break
    }
}