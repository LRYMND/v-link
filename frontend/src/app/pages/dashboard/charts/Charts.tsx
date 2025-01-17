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
                                valueColor={'var(--themeDefault)'}
                                limitColor={'var(--themeAccent)'}
                                boxColor={'var(--boxColorDarker)'}
                                borderColor={'var(--boxColorDark)'}

                                borderWidth={'0px'}

                                height={"10vh"}
                                width={"100%"}

                                labelSize={`calc(3vmin * ${app.system.textScale}`}
                                valueSize={`calc(5vmin * ${app.system.textScale}`}
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
                    <div className='row' style={{overflow:'auto'}}>
                        <LineChart
                            setCount={setCount}
                            width={app.system.contentSize.width - (app.settings.general.contentPadding.value * 2)}
                            height={app.system.contentSize.height * 0.6}
                            padding={70}  // Update with the desired padding
                            tickCountX={5}  // Update with the desired number of X-axis ticks
                            tickCountY={5}  // Update with the desired number of Y-axis ticks
                            length={app.settings.dash_charts.length.value}
                            resolution={app.settings.dash_charts.resolution.value}
                            interpolation={app.settings.dash_charts.interpolation.value}
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
