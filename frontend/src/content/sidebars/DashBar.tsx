import { useState, useEffect } from 'react';

import CarDataStore from '../cardata/store/Datastore'

import "./../../styles.scss"
import "./../../themes.scss"
import "./dashbar.scss";


const DashBar = ({ sensorSettings, applicationSettings, wifiState, phoneState, setView }) => {

    const [carData, setCarData] = useState({})

    useEffect(() => {
        const unsubscribe = CarDataStore.subscribe(
            (event) => {
                setCarData(event.carData)
                //console.log(carData)
            },
        );

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div className={`dashbar ${applicationSettings.app.colorTheme.value}`} style={{ height: `${applicationSettings.interface.heightOSD.value}px` }}>
            <div className="dashbar__data">
                <div className="dashbar__data__item">
                    <p><b>{sensorSettings[applicationSettings.dash_bar.value_1.value].label}:</b> <br />
                    {carData[applicationSettings.dash_bar.value_1.value]}{sensorSettings[applicationSettings.dash_bar.value_1.value].unit}</p>
                </div>

                <div className="dashbar__data__item">
                    <p><b>{sensorSettings[applicationSettings.dash_bar.value_2.value].label}:</b> <br />
                    {carData[applicationSettings.dash_bar.value_2.value]}{sensorSettings[applicationSettings.dash_bar.value_2.value].unit}</p>
                </div>

                <div className="dashbar__data__item">
                    <p><b>{sensorSettings[applicationSettings.dash_bar.value_3.value].label}:</b> <br />
                    {carData[applicationSettings.dash_bar.value_3.value]}{sensorSettings[applicationSettings.dash_bar.value_3.value].unit}</p>
                </div>
            </div>

            <div className="dashbar__banner">
                <svg className="dashbar__banner__graphic">
                    <use xlinkHref="/assets/svg/volvo-typo.svg#volvo"></use>
                </svg>
            </div>

            <div className="dashbar__info">
                <svg className={`status-icon status-icon--${(wifiState ? "active" : "inactive")}`}>
                    <use xlinkHref="/assets/svg/wifi.svg#wifi"></use>
                </svg>

                <svg className={`status-icon status-icon--${'inactive'}`}>
                    <use xlinkHref="/assets/svg/bluetooth.svg#bluetooth"></use>
                </svg>

                <svg className={`status-icon status-icon--${(phoneState ? "active" : "inactive")}`}>
                    <use xlinkHref="/assets/svg/phone.svg#phone"></use>
                </svg>


                <button className='button-styles nav-button' type='button' onClick={() => setView('Dashboard')}>
                    <div>EXIT</div>
                </button>
            </div>
        </div>
    );
};


export default DashBar;