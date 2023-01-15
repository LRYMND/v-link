import React, { useState, useEffect } from 'react';
import Carplay from 'react-js-carplay'
import { useNavigate } from 'react-router-dom';

const { ipcRenderer } = window;
let socket = null;

function CarplayWindow({ settings, setShowNav }) {
    const [status, setStatus] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [connected, setConnected] = useState(false);
    const [start, setStart] = useState(null);

    const navigate = useNavigate();


    useEffect(() => {
        socket = new WebSocket("ws://localhost:3001");
        socket.binaryType = "arraybuffer";
        socket.addEventListener('open', () => { setConnected(true); console.log("connected to socket")})
        ipcRenderer.on('plugged', () => { setStatus(true); console.log("connected") });
        ipcRenderer.on('unplugged', () => { setStatus(false); console.log("disconnected") });
        ipcRenderer.on('quitReq', () => { leaveCarplay() });
        ipcRenderer.send('statusReq');


        return () => {
            //socket.off('connect', () => setConnected(false));
            ipcRenderer.removeAllListeners();
            //socket.close();
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
        <div style={{width: '100%', height: '100%'}}>
	{connected ? <Carplay
            touchEvent={touchEvent}
            ws={socket}
            type={"ws"}
            settings={settings}
            //changeSetting={changeValue}
            status={status}
                    //reload={reload}
            openModal={false}
            //openModalReq={this.openModal.bind(this)}
            //closeModalReq={this.closeModal.bind(this)}
        /> : <div></div>}
	</div>
    );
}

export default CarplayWindow;