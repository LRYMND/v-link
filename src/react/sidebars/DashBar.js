import React from "react";

import ProgressBar from "../components/ProgressBar";
import { useState, useEffect, } from "react";

import "../themes.scss";
import "./dashbar.scss";

const electron = window.require('electron');

const DashBar = ({ settings, boost, coolant, intake, voltage, wifiState, phoneState }) => {

    useEffect(() => {
		loadTheme();
	}, []);

	const [loaded, setLoaded] = useState(false);
	const [colorNeedle, setColorNeedle] = useState(null);

	const [textColor, setTextColor] = useState(null);
	const [textColorActive, setTextColorActive] = useState(null);

	const [fillActive, setFillActive] = useState(null);
	const [fillInactive, setFillInactive] = useState(null);

    const [sectionColor, setSectionColor] = useState(null);


	function loadTheme() {
		let style = getComputedStyle(document.querySelector(".dashbar"));

        setSectionColor(style.getPropertyValue("--sectionColor"));
		setColorNeedle(style.getPropertyValue("--colorNeedle"));
		setTextColor(style.getPropertyValue("--textColor"));
		setTextColorActive(style.getPropertyValue("--textColorActive"));
		setFillActive(style.getPropertyValue("--fillActive"));
		setFillInactive(style.getPropertyValue("--fillInactive"));

		setLoaded(true);
	}

    return (
        <div className={`dashbar ${settings.colorTheme}`}>
            <div className="dashbar__dash">
                <div className="dashbar__dash__bar">
                    <ProgressBar
                    currentValue={boost}
                    maxValue={1.6}
                    unit={'Bar'}
                    warning={0.6}
                    progressColor={fillActive}
                    fillColor={sectionColor}
                    backgroundColor={fillInactive}
                    textColor={textColor}
                    theme={settings.colorTheme} />
                </div>

                <div className="dashbar__dash__bar">
                    <ProgressBar
                    currentValue={intake}
                    maxValue={90}
                    unit={'°C'}
                    warning={60}
                    progressColor={fillActive}
                    fillColor={sectionColor}
                    backgroundColor={fillInactive}
                    textColor={textColor}
                    theme={settings.colorTheme} />
                </div>

                <div className="dashbar__dash__bar">
                    <ProgressBar
                    currentValue={coolant}
                    maxValue={150}
                    unit={'°C'}
                    warning={120}
                    progressColor={fillActive}
                    fillColor={sectionColor}
                    backgroundColor={fillInactive}
                    textColor={textColor}
                    theme={settings.colorTheme} />
                </div>
            </div>
            <div className="dashbar__banner">
                <svg className="dashbar__banner__graphic">
                    <use xlinkHref="./svg/volvo.svg#banner"></use>
                </svg>
            </div>
            <div className="dashbar__info">
                <svg className={`dashbar__icon dashbar__icon--${(wifiState ? "connected" : "disconnected")}`}>
                    <use xlinkHref="./svg/wifi.svg#wifi"></use>
                </svg>
                <svg className={`dashbar__icon dashbar__icon--${'disconnected'}`}>
                    <use xlinkHref="./svg/bluetooth.svg#bluetooth"></use>
                </svg>
                <svg className={`dashbar__icon dashbar__icon--${(phoneState ? "connected" : "disconnected")}`}>
                    <use xlinkHref="./svg/phone.svg#phone"></use>
                </svg>
            </div>
        </div>
    );
};

export default DashBar;