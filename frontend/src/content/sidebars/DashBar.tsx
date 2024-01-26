import { CarData, ApplicationSettings, SensorSettings, Store } from '../store/Store';
import ValueBox from '../components/ValueBox';

import "./../../styles.scss"
import "./../../themes.scss"


const DashBar = () => {

    const applicationSettings = ApplicationSettings((state) => state.applicationSettings);
    const sensorSettings = SensorSettings((state) => state.sensorSettings);
    const carData = CarData((state) => state.carData);
    const store = Store((state) => state);

    const updateStore = Store((state) => state.updateStore);

    const textScale = 1;

    return (
        <div className={`dashbar ${applicationSettings.app.colorTheme.value}`} style={{
            height: `${applicationSettings.side_bars.topBarHeight.value}px`,
            display: 'flex',
            position: 'absolute',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            top: 0,
            width: '100%',
            background: 'var(--background-color)'
        }}>
            <div className='row' style={{ height: "100%" }}>
                <div className='column'>
                    <div className='row' style={{ justifyContent: 'center', gap: '15px' }}>
                        <ValueBox
                            valueKey={applicationSettings.dash_topbar.value_1.value}
                            carData={carData}
                            sensorSettings={sensorSettings}
                            height={"70%"}
                            textColorDefault={'var(--textColorDefault)'}
                            valueColor={'var(--textColorDefault)'}
                            limitColor={'var(--themeAccent)'}
                            labelSize={`calc(1.75vh * ${textScale}`}
                            valueSize={`calc(2.5vh * ${textScale}`}
                            boxColor={'var(--backgroundColor)'}
                            borderColor={'var(--boxColorDark)'}
                            borderWidth={'0vh'}
                            style={"column"}
                        />
                        <ValueBox
                            valueKey={applicationSettings.dash_topbar.value_2.value}
                            carData={carData}
                            sensorSettings={sensorSettings}
                            height={"70%"}
                            textColorDefault={'var(--textColorDefault)'}
                            valueColor={'var(--textColorDefault)'}
                            limitColor={'var(--themeAccent)'}
                            labelSize={`calc(1.75vh * ${textScale}`}
                            valueSize={`calc(2.5vh * ${textScale}`}
                            boxColor={'var(--backgroundColor)'}
                            borderColor={'var(--boxColorDark)'}
                            borderWidth={'0vh'}
                            style={"column"}
                        />
                        <ValueBox
                            valueKey={applicationSettings.dash_topbar.value_3.value}
                            carData={carData}
                            sensorSettings={sensorSettings}
                            height={"70%"}
                            textColorDefault={'var(--textColorDefault)'}
                            valueColor={'var(--textColorDefault)'}
                            limitColor={'var(--themeAccent)'}
                            labelSize={`calc(1.75vh * ${textScale}`}
                            valueSize={`calc(2.5vh * ${textScale}`}
                            boxColor={'var(--backgroundColor)'}
                            borderColor={'var(--boxColorDark)'}
                            borderWidth={'0vh'}
                            style={"column"}
                        />
                    </div>
                </div>
                <div className='column'>
                    <svg viewBox="0 0 350.8 48.95" xmlns="http://www.w3.org/2000/svg">
                        <use xlinkHref="/assets/svg/typo.svg#volvo"></use>
                    </svg>
                </div>
                <div className='column'>
                    <div className='row' style={{ justifyContent: 'center' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <svg className={`status-icon status-icon--${(store.wifiState ? "active" : "inactive")}`}>
                                <use xlinkHref="/assets/svg/wifi.svg#wifi"></use>
                            </svg>

                            <svg className={`status-icon status-icon--${(store.wifiState ? "active" : "inactive")}`}>
                                <use xlinkHref="/assets/svg/bluetooth.svg#bluetooth"></use>
                            </svg>

                            <svg className={`status-icon status-icon--${(store.phoneState ? "active" : "inactive")}`}>
                                <use xlinkHref="/assets/svg/phone.svg#phone"></use>
                            </svg>

                            <button className='input-style nav-button' type='button' onClick={() => updateStore({view: 'Dashboard'})}>
                                <div>EXIT</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default DashBar;