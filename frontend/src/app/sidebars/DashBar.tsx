import { APP } from '../../store/Store';

import ValueBox from '../components/ValueBox';

import "./../../styles.scss"
import "./../../themes.scss"




const DashBar = () => {

    const app = APP((state) => state)
    const system = app.system
    const topbar = app.settings.dash_topbar


    return (
        <div className={`dashbar ${app.settings.general.colorTheme.value}`} style={{
            height: `${app.settings.side_bars.topBarHeight.value}px`,
            display: 'flex',
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
                            sensor={topbar.value_1.value}
                            type={topbar.value_1.type}

                            unit={true}

                            textColorDefault={'var(--textColorDefault)'}
                            valueColor={'var(--textColorDefault)'}
                            limitColor={'var(--themeAccent)'}
                            boxColor={'var(--backgroundColor)'}
                            borderColor={'var(--boxColorDark)'}

                            borderWidth={'0vh'}
                            style={"column"}

                            height={"70%"}
                            width={"100%"}

                            labelSize={`calc(1.75vh * ${system.textScale}`}
                            valueSize={`calc(2.5vh * ${system.textScale}`}
                        />

                        <ValueBox
                            sensor={topbar.value_2.value}
                            type={topbar.value_2.type}

                            unit={true}

                            textColorDefault={'var(--textColorDefault)'}
                            valueColor={'var(--textColorDefault)'}
                            limitColor={'var(--themeAccent)'}
                            boxColor={'var(--backgroundColor)'}
                            borderColor={'var(--boxColorDark)'}

                            borderWidth={'0vh'}
                            style={"column"}

                            height={"70%"}
                            width={"100%"}

                            labelSize={`calc(1.75vh * ${system.textScale}`}
                            valueSize={`calc(2.5vh * ${system.textScale}`}
                        />

                        <ValueBox
                            sensor={topbar.value_3.value}
                            type={topbar.value_3.type}

                            unit={true}

                            textColorDefault={'var(--textColorDefault)'}
                            valueColor={'var(--textColorDefault)'}
                            limitColor={'var(--themeAccent)'}
                            boxColor={'var(--backgroundColor)'}
                            borderColor={'var(--boxColorDark)'}

                            borderWidth={'0vh'}
                            style={"column"}

                            height={"70%"}
                            width={"100%"}

                            labelSize={`calc(1.75vh * ${system.textScale}`}
                            valueSize={`calc(2.5vh * ${system.textScale}`}
                        />

                    </div>
                </div>
                <div className='column'>
                    <svg viewBox="0 0 350.8 48.95" xmlns="http://www.w3.org/2000/svg">
                        <use xlinkHref="/assets/svg/typo.svg#volvo"></use>
                    </svg>
                </div>
                <div className='column'>
                    <div className='row' style={{ justifyContent: 'center'}}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <svg className={`status-icon status-icon--${(system.wifiState ? "active" : "inactive")}`}>
                                <use xlinkHref="/assets/svg/wifi.svg#wifi"></use>
                            </svg>

                            <svg className={`status-icon status-icon--${(system.wifiState ? "active" : "inactive")}`}>
                                <use xlinkHref="/assets/svg/bluetooth.svg#bluetooth"></use>
                            </svg>

                            <svg className={`status-icon status-icon--${(system.phoneState ? "active" : "inactive")}`}>
                                <use xlinkHref="/assets/svg/phone.svg#phone"></use>
                            </svg>

                            <button className='input-style nav-button' type='button' onClick={() => app.update({system: { view: 'Dashboard' }})}>
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