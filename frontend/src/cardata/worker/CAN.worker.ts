import { io } from "socket.io-client";

let sensorSettings;
let carData

// Connect to the settings namespace to retrieve sensorSettings
const settingsChannel = io("ws://localhost:4001/settings");

// Connect to the canbus namespace to receive continuous data stream
const canbusChannel = io("ws://localhost:4001/canbus");

// Function to handle incoming canbus settings
const handlesensorSettings = (settings) => {
    sensorSettings = settings;
    // Subscribe to the canbus namespace after receiving settings
    canbusChannel.connect();
};

// Function to update car data
const updateCarData = (data) => {
    const updatedData = {};

    if (sensorSettings && data != null) {
        Object.keys(sensorSettings).forEach((key) => {
            const message = sensorSettings[key];
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
const postCarDataToMain = (carData) => {
    const message = {
        type: 'message',
        message: carData
      };

    postMessage(message);
};

// Listen for canbus settings
settingsChannel.on("sensors", handlesensorSettings);

// Listen for continuous data stream from canbus namespace
canbusChannel.on("data", (data) => {
    carData = updateCarData(data);
    postCarDataToMain(carData);
});

// Send a request for canbus settings
settingsChannel.emit("requestSensors");



onmessage = async (event: MessageEvent<Command>) => {
    switch (event.data.type) {
        case 'hello':
            postMessage("Webworker says hi?")
            break
    }
}