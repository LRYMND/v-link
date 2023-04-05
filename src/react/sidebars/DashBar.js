import React from "react";
import { useState, useEffect, } from "react";

import ProgressBar from "../components/ProgressBar";

import "../components/themes.scss"
import "./dashbar.scss";

const electron = window.require('electron');
const { ipcRenderer } = electron;

const DashBar = ({ settings }) => {
    const wifiOn = () => {
        setWifiState("connected");
    }

    const wifiOff = () => {
        setWifiState("disconnected");
    }

    const plugged = () => {
        setPhoneState("connected");
    }

    const unplugged = () => {
        setPhoneState("disconnected");
    }

    useEffect(() => {
        ipcRenderer.send('statusReq');
        ipcRenderer.send('updateWifi');

        ipcRenderer.on('wifiOn', wifiOn);
        ipcRenderer.on('wifiOff', wifiOff);
        ipcRenderer.on("plugged", plugged);
        ipcRenderer.on("unplugged", unplugged);

        ipcRenderer.on('msgFromBackground', (event, args) => { msgFromBackground(args)});

        return function cleanup() {
            ipcRenderer.removeAllListeners();
        };
    }, []);

	  const msgFromBackground = (args) => {
		if (args != null)
			//console.log("Debug: ", args);

		if (args.includes("map:")) {
			args = args.replace("map:", "")
			setBoost(Number(args).toFixed(2));
		}
		if (args.includes("iat:")) {
			args = args.replace("iat:", "")
			setIntake(Number(args).toFixed(2));
		}
		if (args.includes("col:")) {
			args = args.replace("col:", "")
			setCoolant(Number(args).toFixed(2));
		}
		if (args.includes("vol:")) {
			args = args.replace("vol:", "")
			setVoltage(Number(args).toFixed(2));
		}
	}

    const [wifiState, setWifiState] = useState("disconnected");
    const [phoneState, setPhoneState] = useState("disconnected");

    const [boost, setBoost] = useState(0);
	const [intake, setIntake] = useState(0);
	const [coolant, setCoolant] = useState(0);
	const [voltage, setVoltage] = useState(0);


    return (
        <div className={`dashbar ${settings.colorTheme}`}>
            <div className="dashbar__dash">
                <div className="dashbar__dash__bar">
                    <ProgressBar currentValue={boost} maxValue={1.5} unit={'bar'} warning={0.6} theme={settings.colorTheme}/>
                </div>
                <div className="dashbar__dash__bar">
                    <ProgressBar currentValue={intake} maxValue={90} unit={'°C'} warning={60} theme={settings.colorTheme}/>
                </div>
                <div className="dashbar__dash__bar">
                    <ProgressBar currentValue={coolant} maxValue={150} unit={'°C'} warning={120} theme={settings.colorTheme}/>
                </div>
            </div>
            <div className="dashbar__banner">
                <svg className="dashbar__banner__graphic">
                    <use xlinkHref="./svg/volvo.svg#banner"></use>
                </svg>
            </div>
            <div className="dashbar__info">
                <svg className={`dashbar__icon dashbar__icon--${wifiState}`}>
                    <use xlinkHref="./svg/wifi.svg#wifi"></use>
                </svg>
                <svg className={`dashbar__icon dashbar__icon--${'disconnected'}`}>
                    <use xlinkHref="./svg/bluetooth.svg#bluetooth"></use>
                </svg>
                <svg className={`dashbar__icon dashbar__icon--${phoneState}`}>
                    <use xlinkHref="./svg/phone.svg#phone"></use>
                </svg>
            </div>
        </div>
    );
};

export default DashBar;