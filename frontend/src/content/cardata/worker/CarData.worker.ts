import { io } from "socket.io-client";

console.log('Worker script is running');

let canbusSettings;
let carData

// Connect to the settings namespace to retrieve canbusSettings
const settingsChannel = io("ws://localhost:4001/settings");

// Connect to the canbus namespace to receive continuous data stream
const canbusChannel = io("ws://localhost:4001/canbus");

// Function to handle incoming canbus settings
const handleCanbusSettings = (settings) => {
    canbusSettings = settings;
    // Subscribe to the canbus namespace after receiving settings
    canbusChannel.connect();
};

// Function to update car data
const updateCarData = (data) => {
    const updatedData = {};

    if (canbusSettings && canbusSettings.messages && data != null) {
        Object.keys(canbusSettings.messages).forEach((key) => {
            const message = canbusSettings.messages[key];
            const rtviId = message.rtvi_id;
            const regex = new RegExp(rtviId, 'g');

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
settingsChannel.on("canbus", handleCanbusSettings);

// Listen for continuous data stream from canbus namespace
canbusChannel.on("data", (data) => {
    carData = updateCarData(data);
    postCarDataToMain(carData);
});

// Send a request for canbus settings
settingsChannel.emit("requestSettings", "canbus");



onmessage = async (event: MessageEvent<Command>) => {
    switch (event.data.type) {
        case 'hello':
            postMessage("Webworker says hi?")
            break
    }
}