import ValueBox from './../../../components/ValueBox';
import LineChart from '../../../components/LineChart'

import "./../../../../styles.scss"
import "./../../../../themes.scss"

const Charts = ({ sensorSettings, applicationSettings, carData, containerSize }) => {

    const value = applicationSettings.constants.chart_input_current;
    const datasets = []

    for (let i = 1; i <= value; i++) {
        const key = "value_" + i

        datasets[i - 1] = {
            label: sensorSettings[applicationSettings.charts[key].value].label,
            color: 'var(--fillActive)',
            yMin: sensorSettings[applicationSettings.charts[key].value].min_value,
            yMax: sensorSettings[applicationSettings.charts[key].value].max_value,
            data: carData[applicationSettings.charts[key].value],
            interval: 100,  // Update with the desired interval in milliseconds
        }
    }

    const renderValueBoxes = () => {
        const rows = [];
        for (let i = 0; i < datasets.length; i += 3) {
            const boxes = datasets.slice(i, i + 3).map((dataset, index) => (
                <div className="column">
                    <ValueBox
                        key={`value_${index + i + 1}`}
                        valueKey={applicationSettings.charts[`value_${index + i + 1}`].value}
                        carData={carData}
                        sensorSettings={sensorSettings}
                        height={45}
						width={'80%'}
						textColor={'var(--textColorDefault)'}
						limitColor={'red'}
						boxColor={'var(--buttonBackground)'}
                    />
                </div>
            ));
            rows.push(<div className='row'>{boxes}</div>);
        }
        return rows;
    };

    return (
        <>
            <div className='row'>
                <LineChart
                    label="Line Chart"
                    width={containerSize.width - applicationSettings.app.dashboardPadding.value}
                    height={containerSize.height * 0.5}
                    padding={70}  // Update with the desired padding
                    tickCountX={5}  // Update with the desired number of X-axis ticks
                    tickCountY={5}  // Update with the desired number of Y-axis ticks
                    length={applicationSettings.charts.length.value}
                    datasets={datasets}
                    color_label={'var(--textColorDefault)'}
                    color_xGrid={'var(--textColorInactive)'}
                    color_yGrid={'var(--textColorInactive)'}
                    color_axis={'var(--textColorDefault)'}
                    color_charts={'var(--fillActive)'}
                />
            </div>
            {renderValueBoxes()}
        </>
    )
};

export default Charts;
