import { React, useState, useEffect, } from "react";

import "../themes.scss";
import "./dashbar.scss";


const DashBar = ({ canbusSettings, userSettings, carData, wifiState, phoneState, setView }) => {

    useEffect(() => {
        loadTheme();
    }, []);


    const [textColor, setTextColor] = useState(null);
    const [fillActive, setFillActive] = useState(null);
    const [fillInactive, setFillInactive] = useState(null);
    const [sectionColor, setSectionColor] = useState(null);


    function loadTheme() {
        let style = getComputedStyle(document.querySelector(".dashbar"));

        setSectionColor(style.getPropertyValue("--sectionColor"));
        setTextColor(style.getPropertyValue("--textColor"));
        setFillActive(style.getPropertyValue("--fillActive"));
        setFillInactive(style.getPropertyValue("--fillInactive"));
    }

    function changeView() {
        setView('Dashboard')
    }




    return (
        <div className={`dashbar ${userSettings.app.colorTheme.value}`}>
            <div className="dashbar__dash">
                <div className="dashbar__dash__bar">
                    <h5>{canbusSettings.messages[userSettings.dash_bar.value_1.value].label}: {carData[userSettings.dash_bar.value_1.value]}{canbusSettings.messages[userSettings.dash_bar.value_1.value].unit}</h5>
                </div>

                <div className="dashbar__dash__bar">
                    <h5>{canbusSettings.messages[userSettings.dash_bar.value_2.value].label}: {carData[userSettings.dash_bar.value_2.value]}{canbusSettings.messages[userSettings.dash_bar.value_2.value].unit}</h5>
                </div>

                <div className="dashbar__dash__bar">
                    <h5>{canbusSettings.messages[userSettings.dash_bar.value_3.value].label}: {carData[userSettings.dash_bar.value_3.value]}{canbusSettings.messages[userSettings.dash_bar.value_3.value].unit}</h5>
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


                <button className='exit-button' type='button' onClick={() => setView('Dashboard')}>
                    <div>EXIT</div>
                </button>
            </div>

            {/*<ProgressBar
                        currentValue={carData[userSettings.dash_bar.value_1.value]}
                        maxValue={canbusSettings.messages[userSettings.dash_bar.value_1.value].max_value}
                        unit={canbusSettings.messages[userSettings.dash_bar.value_1.value].unit}
                        warning={canbusSettings.messages[userSettings.dash_bar.value_1.value].limit_start}
                        progressColor={fillActive}
                        fillColor={sectionColor}
                        backgroundColor={fillInactive}
                        textColor={textColor}
                        theme={userSettings.app.colorTheme.value} />*/}


        </div>
    );
};


export default DashBar;