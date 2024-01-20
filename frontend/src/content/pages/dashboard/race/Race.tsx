import "./../../../../styles.scss"
import "./../../../../themes.scss"

import ValueBox from './../../../components/ValueBox';
import LinearGauge from './../../../components/LinearGauge';


const Race = ({ carData, applicationSettings, sensorSettings, containerSize }) => {
	return (
		<div className="column">
			<div className="row">
				<LinearGauge
					width={containerSize.width - applicationSettings.app.dashboardPadding.value}
					height={containerSize.height * 0.4}
					padding={30}
					numberOfRectangles={50}
					spacing={5}
					ticks={9}
					smallTicks={3}
					decimals={2}
					unit1={sensorSettings[applicationSettings.dash_3.progress_1.value].unit}
					unit2={sensorSettings[applicationSettings.dash_3.progress_2.value].unit}
					value1={carData[applicationSettings.dash_3.progress_1.value]}
					value2={carData[applicationSettings.dash_3.progress_2.value]}
					limitValue2={1.0}
					maxValue={sensorSettings[applicationSettings.dash_3.progress_1.value].max_value}
					limitStart={sensorSettings[applicationSettings.dash_3.progress_1.value].limit_start}
					textColorActive={'var(--textColorActive)'}
					textColorDefault={'var(--textColorDefault)'}
					fillActive={'var(--fillActive)'}
					fillInactive={'var(--fillInactive)'}
					sectionColor={'var(--buttonBackground)'}
					colorNeedle={'var(--colorNeedle)'}
					svgMask={'/assets/svg/progress-mask.svg'}
				/>
			</div>
			<div className="row">
				<ValueBox
					valueKey={applicationSettings.dash_3.value_1.value}
					carData={carData}
					sensorSettings={sensorSettings}
					height={45}
					width={'30%'}
					textColor={'var(--textColorDefault)'}
					limitColor={'red'}
					boxColor={'var(--buttonBackground)'}
				/>
				<ValueBox
					valueKey={applicationSettings.dash_3.value_2.value}
					carData={carData}
					sensorSettings={sensorSettings}
					height={45}
					width={'30%'}
					textColor={'var(--textColorDefault)'}
					limitColor={'red'}
					boxColor={'var(--buttonBackground)'}
				/>
				<ValueBox
					valueKey={applicationSettings.dash_3.value_3.value}
					carData={carData}
					sensorSettings={sensorSettings}
					height={45}
					width={'30%'}
					textColor={'var(--textColorDefault)'}
					limitColor={'red'}
					boxColor={'var(--buttonBackground)'}
				/>
			</div>
			<div className="row">
				<ValueBox
					valueKey={applicationSettings.dash_3.value_4.value}
					carData={carData}
					sensorSettings={sensorSettings}
					height={45}
					width={'30%'}
					textColor={'var(--textColorDefault)'}
					limitColor={'red'}
					boxColor={'var(--buttonBackground)'}
				/>
				<ValueBox
					valueKey={applicationSettings.dash_3.value_5.value}
					carData={carData}
					sensorSettings={sensorSettings}
					height={45}
					width={'30%'}
					textColor={'var(--textColorDefault)'}
					limitColor={'red'}
					boxColor={'var(--buttonBackground)'}
				/>
				<ValueBox
					valueKey={applicationSettings.dash_3.value_6.value}
					carData={carData}
					sensorSettings={sensorSettings}
					carData={carData}
					sensorSettings={sensorSettings}
					height={45}
					width={'30%'}
					textColor={'var(--textColorDefault)'}
					limitColor={'red'}
					boxColor={'var(--buttonBackground)'}
				/>
			</div>
		</div>
	)
};


export default Race;