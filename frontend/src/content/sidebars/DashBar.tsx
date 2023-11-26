import "./../../styles.scss"
import "./../../themes.scss"
import "./dashbar.scss";


const DashBar = ({ canbusSettings, applicationSettings, carData, wifiState, phoneState, setView }) => {

    return (
        <div className={`dashbar ${applicationSettings.app.colorTheme.value}`} style={{ height: `${applicationSettings.interface.heightOSD.value}px`}}>
            <div className="dashbar__dash">
                <div className="dashbar__dash__bar">
                    <h5>{canbusSettings.messages[applicationSettings.dash_bar.value_1.value].label}: {carData[applicationSettings.dash_bar.value_1.value]}{canbusSettings.messages[applicationSettings.dash_bar.value_1.value].unit}</h5>
                </div>

                <div className="dashbar__dash__bar">
                    <h5>{canbusSettings.messages[applicationSettings.dash_bar.value_2.value].label}: {carData[applicationSettings.dash_bar.value_2.value]}{canbusSettings.messages[applicationSettings.dash_bar.value_2.value].unit}</h5>
                </div>

                <div className="dashbar__dash__bar">
                    <h5>{canbusSettings.messages[applicationSettings.dash_bar.value_3.value].label}: {carData[applicationSettings.dash_bar.value_3.value]}{canbusSettings.messages[applicationSettings.dash_bar.value_3.value].unit}</h5>
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