import React from 'react';
import { useState, useEffect } from 'react';

import LineChart from '../../components/LineChart'

import "../../themes.scss";
import './chartboard.scss';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const Chartboard = ({ settings, boost, intake, coolant, voltage, timeStamps, valueArray }) => {

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
        let style = getComputedStyle(document.querySelector(".dashboard"));

        setSectionColor(style.getPropertyValue("--sectionColor"));
        setColorNeedle(style.getPropertyValue("--colorNeedle"));
        setTextColor(style.getPropertyValue("--textColor"));
        setTextColorActive(style.getPropertyValue("--textColorActive"));
        setFillActive(style.getPropertyValue("--fillActive"));
        setFillInactive(style.getPropertyValue("--fillInactive"));

        setLoaded(true);
    }

    return (
        <div className={`dashboard ${settings.colorTheme}`}>
            <div className="dashboard__header">
            </div>
            {loaded ?
                <div className="dashboard__charts">

                    <LineChart
                    yData={valueArray}
                    xData={timeStamps}/>

                </div> : <></>}
            <div className="dashboard__footer">
                {settings.activateCAN ? <></> : <div><h3><i>(CAN-Stream deactivated.)</i></h3></div>}
            </div>
        </div>
    )
};

export default Chartboard;