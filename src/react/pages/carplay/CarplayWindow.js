import React, { useState, useEffect } from 'react';
import JMuxer from 'jmuxer';
import io from 'socket.io-client'
import Carplay from './Carplay'
import { useNavigate } from 'react-router-dom';

const { ipcRenderer } = window;
let socket = null;


const useConstructor = (callBack = () => { }) => {
    const [hasBeenCalled, setHasBeenCalled] = useState(false);
    if (hasBeenCalled) return;
    callBack();
    setHasBeenCalled(true);
}


function CarplayWindow({ settings, setShowNav }) {
    const [status, setStatus] = useState(false);
    //const [playing, setPlaying] = useState(false);
    //const [connected, setConnected] = useState(false);
    //const [start, setStart] = useState(null);

    const navigate = useNavigate();

    useConstructor(() => {
        socket = new WebSocket("ws://localhost:3001");
        socket.binaryType = "arraybuffer";
      });

    useEffect(() => {
        console.log("Socket: ", socket);

        ipcRenderer.on('plugged', () => { setStatus(true); console.log("connected") });
        ipcRenderer.on('unplugged', () => { setStatus(false); console.log("disconnected") });
        ipcRenderer.on('quitReq', () => { leaveCarplay() });
        ipcRenderer.send('statusReq');


        return function cleanup() {
            console.log("CLEANUP");
            ipcRenderer.removeAllListeners();
        };
    }, []);

    useEffect(() => {
        if (status) {
            if (window.location.hash === "#/" || window.location.hash === "") {
                setShowNav(false);
            }
        } else {
            setShowNav(true);
        }
    }, [status]);

    const touchEvent = (type, x, y) => {
        ipcRenderer.send('click', { type: type, x: x, y: y });
        //console.log("touch event type: ", +type + " x: " + x + " y:" + y);
    };

    function leaveCarplay() {
        setShowNav(true);
        navigate("/dashboard");
        console.log("leaving carplay");
    }

    return (
        <Carplay
            touchEvent={touchEvent}
            ws={socket}
            type={"ws"}
            settings={settings}
            status={status}
        />

    );
}

export default CarplayWindow;