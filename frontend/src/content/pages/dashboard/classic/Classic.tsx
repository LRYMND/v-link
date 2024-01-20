import RadialGauge from '../../../components/RadialGauge'
import ValueBox from '../../../components/ValueBox'

import "./../../../../styles.scss"
import "./../../../../themes.scss"



const Classic = ({ applicationSettings, sensorSettings, carData, containerSize }) => {
	return (
		<>
			<div className="row">
				<div className="column">
					<RadialGauge
						currentValue={carData[applicationSettings.dash_1.gauge_1.value]}
						maxValue={sensorSettings[applicationSettings.dash_1.gauge_1.value].max_value}
						limitStart={sensorSettings[applicationSettings.dash_1.gauge_1.value].limit_start}
						title={sensorSettings[applicationSettings.dash_1.gauge_1.value].label}
						unit={sensorSettings[applicationSettings.dash_1.gauge_1.value].unit}

						globalRotation={90}
						size={(containerSize.width / 3) * 0.8}
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

						progressBackgroundColor={'var(--fillInactive)'}
						progressFillerColor={'var(--fillActive)'}
						tickColor={'var(--fillInactive)'}
						limitColor={'var(--colorNeedle)'}
						needleColor={'var(--colorNeedle)'}
						textColor1={'var(--fillInactive)'}
						textColor2={'var(--textColorActive)'}
						pivotColor={'var(--sectionColor)'}
						borderColor={'var(--sectionColor)'}
					/>
				</div>
				<div className="column">
					<RadialGauge
						currentValue={carData[applicationSettings.dash_1.gauge_2.value]}
						maxValue={sensorSettings[applicationSettings.dash_1.gauge_2.value].max_value}
						limitStart={sensorSettings[applicationSettings.dash_1.gauge_2.value].limit_start}
						title={sensorSettings[applicationSettings.dash_1.gauge_2.value].label}
						unit={sensorSettings[applicationSettings.dash_1.gauge_2.value].unit}

						globalRotation={90}
						size={(containerSize.width / 3) * 0.9}
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

						progressBackgroundColor={'var(--fillInactive)'}
						progressFillerColor={'var(--fillActive)'}
						tickColor={'var(--fillInactive)'}
						limitColor={'var(--colorNeedle)'}
						needleColor={'var(--colorNeedle)'}
						textColor1={'var(--fillInactive)'}
						textColor2={'var(--textColorActive)'}
						pivotColor={'var(--sectionColor)'}
						borderColor={'var(--sectionColor)'}
					/>
				</div>
				<div className="column">
					<RadialGauge
						currentValue={carData[applicationSettings.dash_1.gauge_3.value]}
						maxValue={sensorSettings[applicationSettings.dash_1.gauge_3.value].max_value}
						limitStart={sensorSettings[applicationSettings.dash_1.gauge_3.value].limit_start}
						title={sensorSettings[applicationSettings.dash_1.gauge_3.value].label}
						unit={sensorSettings[applicationSettings.dash_1.gauge_3.value].unit}

						globalRotation={90}
						size={(containerSize.width / 3) * 0.8}
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

						progressBackgroundColor={'var(--fillInactive)'}
						progressFillerColor={'var(--fillActive)'}
						tickColor={'var(--fillInactive)'}
						limitColor={'var(--colorNeedle)'}
						needleColor={'var(--colorNeedle)'}
						textColor1={'var(--fillInactive)'}
						textColor2={'var(--textColorActive)'}
						pivotColor={'var(--sectionColor)'}
						borderColor={'var(--sectionColor)'}
					/>
				</div>

			</div>
			<div className="row">
				<div className="column">
					<ValueBox
						valueKey={applicationSettings.dash_1.value_2.value}
						carData={carData}
						sensorSettings={sensorSettings}
						height={45}
						width={'80%'}
						textColor={'var(--textColorDefault)'}
						limitColor={'red'}
						boxColor={'var(--backgroundColor)'}
						borderColor={'var(--buttonBackground)'}
						borderWidth={4}
					/>
				</div>
				<div className="column">
					<ValueBox
						valueKey={applicationSettings.dash_1.value_1.value}
						carData={carData}
						sensorSettings={sensorSettings}
						height={45}
						width={'80%'}
						textColor={'var(--textColorDefault)'}
						limitColor={'red'}
						borderColor={'var(--buttonBackground)'}
						borderWidth={4}
					/>
				</div>
				<div className="column">
					<ValueBox
						valueKey={applicationSettings.dash_1.value_3.value}
						carData={carData}
						sensorSettings={sensorSettings}
						height={45}
						width={'80%'}
						textColor={'var(--textColorDefault)'}
						limitColor={'red'}
						borderColor={'var(--buttonBackground)'}
						borderWidth={4}
					/>
				</div>
			</div >
		</>
	)
};


export default Classic;