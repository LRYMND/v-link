import React, { useState, useEffect } from 'react';
import JMuxer from 'jmuxer';
import io from 'socket.io-client'
import Carplay from './Carplay'
import { useNavigate } from 'react-router-dom';
import WebSocket from 'ws';

const { ipcRenderer } = window;
let socket = null;

socket = new WebSocket("ws://localhost:3001");
socket.binaryType = "arraybuffer";

const useConstructor = (callBack = () => { }) => {
    const [hasBeenCalled, setHasBeenCalled] = useState(false);
    if (hasBeenCalled) return;
    callBack();
    setHasBeenCalled(true);
}


function CarplayWindow({ settings, setShowNav }) {
    const [status, setStatus] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [connected, setConnected] = useState(false);
    const [start, setStart] = useState(null);

    const navigate = useNavigate();


    //const socket = io("ws://localhost:3001", {transports: ['websocket'], upgrade: false}).connect("ws://localhost:3001");
    /*
    useConstructor(() => {
        socket = new WebSocket("ws://localhost:3001");
        socket.binaryType = "arraybuffer";
    });
    */

    socket.on('open', function open() {
        console.log('connected');
      });

    useEffect(() => {
        console.log("Socket: ", socket);
        //socket.on('connect', () => setConnected(true))

        ipcRenderer.on('plugged', () => { setStatus(true); console.log("connected") });
        ipcRenderer.on('unplugged', () => { setStatus(false); console.log("disconnected") });
        ipcRenderer.on('quitReq', () => { leaveCarplay() });
        ipcRenderer.send('statusReq');


        return function cleanup() {
            //socket.off('connect', () => setConnected(false));
            console.log("CLEANUP");
            ipcRenderer.removeAllListeners();
            socket.close();
            //socket.disconnect(true);
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
        console.log("touch event type: ", +type + " x: " + x + " y:" + y);
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