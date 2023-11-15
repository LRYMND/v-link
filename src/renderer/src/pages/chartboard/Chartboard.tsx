import React from 'react';
import LineChart from '../../components/rtvi/LineChart'

import "../../themes.scss";
import './chartboard.scss';

const Chartboard = ({ canbusSettings, userSettings, carData, length }) => {

    return (
        <div className={`chartboard ${userSettings.app.colorTheme.value}`}>
            <div className="chartboard__header">
            </div>

            {canbusSettings && userSettings ?
                <div className="chartboard__content">
                    <div className="chartboard__content__left">
                        <div className="chartboard__content__element">
                            <div className="chartboard__content__element__label">
                                <h5>{canbusSettings.messages[userSettings.dash_2.value_1.value].label}</h5>
                            </div>
                            <div className="chartboard__content__element__value">
                                <h1>{carData[userSettings.dash_2.value_1.value]}{canbusSettings.messages[userSettings.dash_2.value_1.value].unit}</h1>
                            </div>
                        </div>

                        <div className="chartboard__content__element">
                            <div className="chartboard__content__element__label">
                                <h5>{canbusSettings.messages[userSettings.dash_2.value_2.value].label}</h5>
                            </div>
                            <div className="chartboard__content__element__value">
                                <h1>{carData[userSettings.dash_2.value_2.value]}{canbusSettings.messages[userSettings.dash_2.value_2.value].unit}</h1>
                            </div>
                        </div>

                        <div className="chartboard__content__element">
                            <div className="chartboard__content__element__label">
                                <h5>{canbusSettings.messages[userSettings.dash_2.value_3.value].label}</h5>
                            </div>
                            <div className="chartboard__content__element__value">
                                <h1>{carData[userSettings.dash_2.value_3.value]}{canbusSettings.messages[userSettings.dash_2.value_3.value].unit}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="chartboard__content__right">
                        <LineChart
                            userSettings={userSettings}

                            label={canbusSettings.messages[userSettings.dash_2.chart_1.value].label}
                            carData={carData[userSettings.dash_2.chart_1.value]}
                            unit={canbusSettings.messages[userSettings.dash_2.chart_1.value].unit}
                            yMin={userSettings.charts.chart_1_min.value}
                            yMax={userSettings.charts.chart_1_max.value}
                            interval={userSettings.charts.chart_1_interval.value}

                            width={500}
                            height={150}
                            padding={30}
                            length={length}
                            tickCountX={5}
                            tickCountY={2}
                        />

                        <LineChart
                            userSettings={userSettings}

                            label={canbusSettings.messages[userSettings.dash_2.chart_2.value].label}
                            carData={carData[userSettings.dash_2.chart_2.value]}
                            unit={canbusSettings.messages[userSettings.dash_2.chart_2.value].unit}
                            yMin={userSettings.charts.chart_2_min.value}
                            yMax={userSettings.charts.chart_2_max.value}
                            interval={userSettings.charts.chart_2_interval.value}

                            width={500}
                            height={150}
                            padding={30}
                            length={length}
                            tickCountX={5}
                            tickCountY={2}
                        />
                    </div>
                </div> : <></>}
            <div className="chartboard__footer">
                {userSettings.interface.activateCAN.value ? <></> : <div><h3><i>(CAN-Stream deactivated.)</i></h3></div>}
            </div>
        </div >
    )
};

export default Chartboard;
