import { io } from "socket.io-client";

let settings;

// Connect to the canbus namespace to receive continuous data stream
const canChannel = io("ws://localhost:4001/can");

// Function to handle incoming canbus settings
const handlesensorSettings = (data) => {
    settings = data.sensors;
    canChannel.connect();
};

// Function to update car data
const update = (data) => {
    const updatedData = {};

    if (settings && data != null) {
        Object.keys(settings).forEach((key) => {
            const message = settings[key];
            const id = message.v-link_id;
            const regex = new RegExp(id, 'g');

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

// Listen for canbus settings
canChannel.on("settings", handlesensorSettings);

// Listen for continuous data stream from canbus namespace
canChannel.on("data", (data) => {
    data = update(data);
    postCarDataToMain(data);
});

// Send a request for canbus settings
canChannel.emit("load");



onmessage = async (event: MessageEvent<Command>) => {
    switch (event.data.type) {
        case 'hello':
            postMessage("Webworker says hi?")
            break
    }
}