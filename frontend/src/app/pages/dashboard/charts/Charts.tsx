import { useState, useEffect } from 'react';
import { APP } from '../../../../store/Store';

import ValueBox from './../../../components/ValueBox';
import LineChart from '../../../components/LineChart'

import "./../../../../styles.scss"
import "./../../../../themes.scss"

const Charts = () => {
    const app = APP((state) => state);

    const setCount = app.settings.constants.chart_input_current;

    const [themeDefault, setThemeDefault] = useState()
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const theme = document.querySelector(`.${app.settings.general.colorTheme.value}`);
        const computedStyles = getComputedStyle(theme);
        setThemeDefault(computedStyles.getPropertyValue('--themeDefault'));
        setReady(true)
    }, []);



    const renderValueBoxes = () => {
        const rows = [];

        for (let i = 0; i < setCount; i += 3) {
            const boxes = [];

            for (let j = 0; j < 3; j++) {
                const currentIndex = i + j;

                if (currentIndex < setCount) {
                    boxes.push(
                        <div key={`value_${currentIndex + 1}`} className="column">
                            <ValueBox
                                sensor={app.settings.dash_charts[`value_${currentIndex + 1}`]?.value}
                                type={app.settings.dash_charts[`value_${currentIndex + 1}`]?.type}
                                unit={true}

                                textColorDefault={'var(--textColorDefault)'}
                                valueColor={'var(--textColorDefault)'}
                                limitColor={'var(--themeAccent)'}
                                boxColor={'var(--backgroundColor)'}
                                borderColor={'var(--boxColorDark)'}

                                borderWidth={'.75vh'}
                                style={"column"}

                                height={"10vh"}
                                width={"100%"}

                                labelSize={`calc(3vh * ${app.system.textScale})`}
                                valueSize={`calc(6vh * ${app.system.textScale})`}
                            />
                        </div>
                    );
                }
            }

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
                            setCount={setCount}
                            width={app.system.contentSize.width - app.settings.constants.padding}
                            height={app.system.contentSize.height * 0.6}
                            padding={70}  // Update with the desired padding
                            tickCountX={5}  // Update with the desired number of X-axis ticks
                            tickCountY={5}  // Update with the desired number of Y-axis ticks
                            length={app.settings.dash_charts.length.value}
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
