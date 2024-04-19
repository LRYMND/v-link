import { useState, useEffect } from 'react'
import { CarData, ApplicationSettings, SensorSettings, Store } from '../../../../store/Store';

import RadialGauge from '../../../components/RadialGauge'
import ValueBox from '../../../components/ValueBox'

import "./../../../../styles.scss"
import "./../../../../themes.scss"



const Classic = () => {
	const carData = CarData((state) => state.carData);
	const sensorSettings = SensorSettings((state) => state.sensorSettings);
	const applicationSettings = ApplicationSettings((state) => state.applicationSettings);
	const store = Store((state) => state);

	const gaugeSize = 0.65 // 0.1 - 1.0 -> Percentage of parent div height
	const gauges = 3
	const [size, setSize] = useState(0);

	useEffect(() => {
		const width = (store.contentSize.width - (applicationSettings.app.dashboardPadding.value * 2)) / gauges
		const height = (store.contentSize.height * gaugeSize)

		if (width <= height) {
			setSize(width)
		} else if (width >= height) {
			setSize(height)
		}
	}, [store.contentSize, applicationSettings.app.dashboardPadding.value])


	return (
		<>
			<div className="row">
				<div className="column">
					<RadialGauge
						currentValue={carData[applicationSettings.dash_classic.gauge_1.value]}
						maxValue={sensorSettings[applicationSettings.dash_classic.gauge_1.value].max_value}
						limitStart={sensorSettings[applicationSettings.dash_classic.gauge_1.value].limit_start}
						title={sensorSettings[applicationSettings.dash_classic.gauge_1.value].label}
						unit={sensorSettings[applicationSettings.dash_classic.gauge_1.value].unit}

						globalRotation={90}
						size={size * 0.9}
						progressOffset={-30}
						progressWidth={5}
						limitOffset={-20}
						limitWidth={2}
						tickWidth={2}
						bigTicks={3}
						smallTicks={4}
						heightBigTicks={10}
						heightSmallTicks={3}
						needleOffset={-30}
						needleWidth={2}
						borderSize={1}
						borderGap={5}

						progressBackgroundColor={'var(--boxColorLighter)'}
						progressFillerColor={'var(--themeDefault)'}
						tickColor={'var(--boxColorLighter)'}
						limitColor={'var(--themeAccent)'}
						needleColor={'var(--themeAccent)'}
						textColor1={'var(--boxColorLighter)'}
						textColor2={'var(--themeDefault)'}
						pivotColor={'var(--boxColorDefault)'}
						borderColor={'var(--boxColorDefault)'}
					/>
				</div>
				<div className="column">
					<RadialGauge
						currentValue={carData[applicationSettings.dash_classic.gauge_2.value]}
						maxValue={sensorSettings[applicationSettings.dash_classic.gauge_2.value].max_value}
						limitStart={sensorSettings[applicationSettings.dash_classic.gauge_2.value].limit_start}
						title={sensorSettings[applicationSettings.dash_classic.gauge_2.value].label}
						unit={sensorSettings[applicationSettings.dash_classic.gauge_2.value].unit}

						globalRotation={90}
						size={size}
						progressOffset={-30}
						progressWidth={5}
						limitOffset={-20}
						limitWidth={2}
						tickWidth={2}
						bigTicks={3}
						smallTicks={4}
						heightBigTicks={10}
						heightSmallTicks={3}
						needleOffset={-30}
						needleWidth={2}
						borderSize={1}
						borderGap={5}

						progressBackgroundColor={'var(--boxColorLighter)'}
						progressFillerColor={'var(--themeDefault)'}
						tickColor={'var(--boxColorLighter)'}
						limitColor={'var(--themeAccent)'}
						needleColor={'var(--themeAccent)'}
						textColor1={'var(--boxColorLighter)'}
						textColor2={'var(--themeDefault)'}
						pivotColor={'var(--boxColorDefault)'}
						borderColor={'var(--boxColorDefault)'}
					/>
				</div>
				<div className="column">
					<RadialGauge
						currentValue={carData[applicationSettings.dash_classic.gauge_3.value]}
						maxValue={sensorSettings[applicationSettings.dash_classic.gauge_3.value].max_value}
						limitStart={sensorSettings[applicationSettings.dash_classic.gauge_3.value].limit_start}
						title={sensorSettings[applicationSettings.dash_classic.gauge_3.value].label}
						unit={sensorSettings[applicationSettings.dash_classic.gauge_3.value].unit}

						globalRotation={90}
						size={size * 0.9}
						progressOffset={-30}
						progressWidth={5}
						limitOffset={-20}
						limitWidth={2}
						tickWidth={2}
						bigTicks={3}
						smallTicks={4}
						heightBigTicks={10}
						heightSmallTicks={3}
						needleOffset={-30}
						needleWidth={2}
						borderSize={1}
						borderGap={5}

						progressBackgroundColor={'var(--boxColorLighter)'}
						progressFillerColor={'var(--themeDefault)'}
						tickColor={'var(--boxColorLighter)'}
						limitColor={'var(--themeAccent)'}
						needleColor={'var(--themeAccent)'}
						textColor1={'var(--boxColorLighter)'}
						textColor2={'var(--themeDefault)'}
						pivotColor={'var(--boxColorDefault)'}
						borderColor={'var(--boxColorDefault)'}
					/>
				</div>

			</div>
			<div className="row">
				<div className="column">
					<ValueBox
						valueKey={applicationSettings.dash_classic.value_2.value}
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
				<div className="column">
					<ValueBox
						valueKey={applicationSettings.dash_classic.value_1.value}
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
				<div className="column">
					<ValueBox
						valueKey={applicationSettings.dash_classic.value_3.value}
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
			</div >
		</>
	)
};


export default Classic;