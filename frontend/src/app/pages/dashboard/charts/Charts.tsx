import { useState, useEffect } from 'react';
import { CarData, ApplicationSettings, SensorSettings, Store } from '../../../../store/Store';

import ValueBox from './../../../components/ValueBox';
import LineChart from '../../../components/LineChart'

import "./../../../../styles.scss"
import "./../../../../themes.scss"

const Charts = () => {


    const carData = CarData((state) => state.carData);
    const sensorSettings = SensorSettings((state) => state.sensorSettings);
    const applicationSettings = ApplicationSettings((state) => state.applicationSettings);
    const store = Store((state) => state);

    const value = applicationSettings.constants.chart_input_current;
    const datasets = []

    const [themeDefault, setThemeDefault] = useState()
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const theme = document.querySelector(`.${applicationSettings.app.colorTheme.value}`);
        const computedStyles = getComputedStyle(theme);
        setThemeDefault(computedStyles.getPropertyValue('--themeDefault'));
        setReady(true)
        console.log(`--themeDefault value is: ${themeDefault}`);
    }, []);

    for (let i = 1; i <= value; i++) {
        const key = "value_" + i

        datasets[i - 1] = {
            label: sensorSettings[applicationSettings.dash_charts[key].value].label,
            color: 'var(--themeDefault)',
            yMin: sensorSettings[applicationSettings.dash_charts[key].value].min_value,
            yMax: sensorSettings[applicationSettings.dash_charts[key].value].max_value,
            data: carData[applicationSettings.dash_charts[key].value],
            interval: 100,  // Update with the desired interval in milliseconds
        }
    }

    const renderValueBoxes = () => {
        const rows = [];
        for (let i = 0; i < datasets.length; i += 3) {
            const boxes = datasets.slice(i, i + 3).map((dataset, index) => (
                <div key={`value_${index + i + 1}`} className="column">
                    <ValueBox
                        valueKey={applicationSettings.dash_charts[`value_${index + i + 1}`].value}
                        carData={carData}
                        sensorSettings={sensorSettings}
                        height={"10vh"}
                        textColorDefault={'var(--textColorDefault)'}
                        valueColor={'var(--themeDefault)'}
                        limitColor={'var(--themeAccent)'}
                        labelSize={`calc(3vh * ${store.textScale}`}
                        valueSize={`calc(6vh * ${store.textScale}`}
                        boxColor={'var(--boxColorDarker)'}
                        borderColor={'var(--boxColorDark)'}
                        borderWidth={'.75vh'}
                    />
                </div>
            ));
            rows.push(<div key={`row_${i}`} className='row'>{boxes}</div>);
        }
        return rows;
    };

    return (
        <>
            {ready ?
                <>
                    <div className='row'>
                        <LineChart
                            label="Line Chart"
                            width={store.contentSize.width - applicationSettings.constants.padding}
                            height={store.contentSize.height * 0.6}
                            padding={70}  // Update with the desired padding
                            tickCountX={5}  // Update with the desired number of X-axis ticks
                            tickCountY={5}  // Update with the desired number of Y-axis ticks
                            length={applicationSettings.dash_charts.length.value}
                            datasets={datasets}
                            backgroundColor={'var(--backgroundColor)'}
                            color_label={'var(--textColorDefault)'}
                            color_xGrid={'var(--textColorDark)'}
                            color_yGrid={'var(--textColorDark)'}
                            color_axis={'var(--textColorDefault)'}
                            color_dash_charts={themeDefault}
                        />
                    </div>
                    {renderValueBoxes()}
                </> : <></>}
        </>
    )
};

export default Charts;
