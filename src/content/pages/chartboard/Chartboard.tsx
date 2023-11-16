import React from 'react';
import LineChart from '../../components/LineChart'

import "./../../../styles.scss"
import "./../../../themes.scss"
import './chartboard.scss';

const Chartboard = ({ canbusSettings, applicationSettings, carData, length }) => {

    return (
        <div className={`chartboard ${applicationSettings.app.colorTheme.value}`}>
            <div className="chartboard__header">
            </div>

            {canbusSettings && applicationSettings ?
                <div className="chartboard__content">
                    <div className="chartboard__content__left">
                        <div className="output">
                            <div className="output__label">
                                <h5>{canbusSettings.messages[applicationSettings.dash_2.value_1.value].label}</h5>
                            </div>
                            <div className="output__data">
                                <h1>{carData[applicationSettings.dash_2.value_1.value]}{canbusSettings.messages[applicationSettings.dash_2.value_1.value].unit}</h1>
                            </div>
                        </div>

                        <div className="output">
                            <div className="output__label">
                                <h5>{canbusSettings.messages[applicationSettings.dash_2.value_2.value].label}</h5>
                            </div>
                            <div className="output__data">
                                <h1>{carData[applicationSettings.dash_2.value_2.value]}{canbusSettings.messages[applicationSettings.dash_2.value_2.value].unit}</h1>
                            </div>
                        </div>

                        <div className="output">
                            <div className="output__label">
                                <h5>{canbusSettings.messages[applicationSettings.dash_2.value_3.value].label}</h5>
                            </div>
                            <div className="output__data">
                                <h1>{carData[applicationSettings.dash_2.value_3.value]}{canbusSettings.messages[applicationSettings.dash_2.value_3.value].unit}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="chartboard__content__right">
                        <LineChart
                            applicationSettings={applicationSettings}

                            label={canbusSettings.messages[applicationSettings.dash_2.chart_1.value].label}
                            carData={carData[applicationSettings.dash_2.chart_1.value]}
                            unit={canbusSettings.messages[applicationSettings.dash_2.chart_1.value].unit}
                            yMin={applicationSettings.charts.chart_1_min.value}
                            yMax={applicationSettings.charts.chart_1_max.value}
                            interval={applicationSettings.charts.chart_1_interval.value}

                            width={500}
                            height={150}
                            padding={30}
                            length={length}
                            tickCountX={5}
                            tickCountY={2}
                        />

                        <LineChart
                            applicationSettings={applicationSettings}

                            label={canbusSettings.messages[applicationSettings.dash_2.chart_2.value].label}
                            carData={carData[applicationSettings.dash_2.chart_2.value]}
                            unit={canbusSettings.messages[applicationSettings.dash_2.chart_2.value].unit}
                            yMin={applicationSettings.charts.chart_2_min.value}
                            yMax={applicationSettings.charts.chart_2_max.value}
                            interval={applicationSettings.charts.chart_2_interval.value}

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
                {applicationSettings.connections.activateCAN.value ? <></> : <div><h3><i>(CAN-Stream deactivated.)</i></h3></div>}
            </div>
        </div >
    )
};

export default Chartboard;
