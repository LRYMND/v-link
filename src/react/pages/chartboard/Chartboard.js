import React from 'react';
import { useState, useEffect } from 'react';

import LineChart from '../../components/LineChart'

import "../../themes.scss";
import './chartboard.scss';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const Chartboard = ({ settings, boost, intake, coolant, voltage, lambda1, lambda2, timeStamps, valueArray }) => {

    const x = 100; // The number of latest values to store

    useEffect(() => {
        setDataStream1((prevDataStream1) => [lambda1, ...prevDataStream1.slice(0, x - 1)]);
        setDataStream2((prevDataStream2) => [lambda2, ...prevDataStream2.slice(0, x - 1)]);
    }, [lambda1, lambda2]);

    const [dataStream1, setDataStream1] = useState([]);
    const [dataStream2, setDataStream2] = useState([]);

    //START TESTCODE
    const [dataStream, setDataStream] = useState([]);


    // Function to handle new data coming from the data stream
    const handleNewData = (newValue1, newValue2) => {
        // Add the new value to the beginning of the array
        setDataStream1((prevDataStream) => [newValue1, ...prevDataStream.slice(0, x - 1)]);
        setDataStream2((prevDataStream) => [newValue2, ...prevDataStream.slice(0, x - 1)]);
    };

    const simulateDataStream = () => {
        setInterval(() => {
            var newValue1 = 0.9 + Math.random() * 0.2; // Generate a random
            var newValue2 = 0.9 + Math.random() * 0.2; // Generate a random 
            if (newValue1 > 1.04) newValue1 = 2;
            handleNewData(newValue1, newValue2);
        }, 100); // Update interval of 1 second
    };

    //END TESTCODE

    useEffect(() => {
        loadTheme();
        simulateDataStream(); //TESTCODE
    }, []);

    const [loaded, setLoaded] = useState(false);
    const [colorNeedle, setColorNeedle] = useState(null);

    const [textColor, setTextColor] = useState(null);
    const [textColorActive, setTextColorActive] = useState(null);

    const [fillActive, setFillActive] = useState(null);
    const [fillInactive, setFillInactive] = useState(null);

    const [sectionColor, setSectionColor] = useState(null);

    const currentValue = 0.0


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
        <div className={`chartboard ${settings.colorTheme}`}>
            <div className="chartboard__header">
            </div>
            {loaded ?
                <div className="chartboard__content">
                    <div className="chartboard__content__left">
                        <div className="chartboard__content__element">
                            <div className="chartboard__content__element__label">
                                <h5>Boost:</h5>
                            </div>
                            <div className="chartboard__content__element__value">
                                <h1>{boost} Bar</h1>
                            </div>
                        </div>
                        
                        <div className="chartboard__content__element">
                            <div className="chartboard__content__element__label">
                                <h5>Intake:</h5>
                            </div>
                            <div className="chartboard__content__element__value">
                                <h1>{intake}°C</h1>
                            </div>
                        </div>

                        <div className="chartboard__content__element">
                            <div className="chartboard__content__element__label">
                                <h5>Coolant:</h5>
                            </div>
                            <div className="chartboard__content__element__value">
                                <h1>{coolant}°C</h1>
                            </div>
                        </div>
                    </div>
                    <div className="chartboard__content__right">
                        <LineChart
                            label="λ1"
                            settings={settings}
                            yData={dataStream1}
                            xData={timeStamps}
                            width={400}
                            height={120}
                            padding={15} />

                        <LineChart
                            label="λ2"
                            settings={settings}
                            yData={dataStream2}
                            xData={timeStamps}
                            width={400}
                            height={120}
                            padding={15} />
                    </div>
                </div> : <></>
            }
            <div className="chartboard__footer">
                {settings.activateCAN ? <></> : <div><h3><i>(CAN-Stream deactivated.)</i></h3></div>}
            </div>
        </div >
    )
};

export default Chartboard;