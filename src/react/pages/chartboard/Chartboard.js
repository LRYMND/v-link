import React from 'react';
import LineChart from '../../components/LineChart'

import "../../themes.scss";
import './chartboard.scss';

const Chartboard = ({ settings, carData, length }) => {
    
    return (
        <div className={`chartboard ${settings.colorTheme}`}>
            <div className="chartboard__header">
            </div>

                <div className="chartboard__content">
                    <div className="chartboard__content__left">
                        <div className="chartboard__content__element">
                            <div className="chartboard__content__element__label">
                                <h5>Boost:</h5>
                            </div>
                            <div className="chartboard__content__element__value">
                                <h1>{carData.boost} Bar</h1>
                            </div>
                        </div>

                        <div className="chartboard__content__element">
                            <div className="chartboard__content__element__label">
                                <h5>Intake:</h5>
                            </div>
                            <div className="chartboard__content__element__value">
                                <h1>{carData.intake}°C</h1>
                            </div>
                        </div>

                        <div className="chartboard__content__element">
                            <div className="chartboard__content__element__label">
                                <h5>Coolant:</h5>
                            </div>
                            <div className="chartboard__content__element__value">
                                <h1>{carData.coolant}°C</h1>
                            </div>
                        </div>
                    </div>

                    <div className="chartboard__content__right">
                        <LineChart
                            label="λ1"
                            width={450}
                            height={170}
                            padding={30}
                            settings={settings}
                            carData={carData.lambda1}
                            length={length}
                            yMin={.8}
                            yMax={1.2}
                            tickCountX={5}
                            tickCountY={2}
                         />

                        <LineChart
                            label="λ2"
                            width={450}
                            height={170}
                            padding={30}
                            settings={settings}
                            carData={carData.lambda2}
                            length={length}
                            yMin={0}
                            yMax={2}
                            tickCountX={5}
                            tickCountY={2}
                        />
                    </div>
                </div>
            <div className="chartboard__footer">
                {settings.activateCAN ? <></> : <div><h3><i>(CAN-Stream deactivated.)</i></h3></div>}
            </div>
        </div >
    )
};

export default Chartboard;
