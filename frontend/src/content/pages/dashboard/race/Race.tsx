import "./../../../../styles.scss"
import "./../../../../themes.scss"

import ValueBox from './../../../components/ValueBox';
import LinearGauge from './../../../components/LinearGauge';
import { CarData, ApplicationSettings, SensorSettings, Store } from '../../../store/Store';


const Race = () => {
	const carData = CarData((state) => state.carData);
	const sensorSettings = SensorSettings((state) => state.sensorSettings);
	const applicationSettings = ApplicationSettings((state) => state.applicationSettings);
	const store = Store((state) => state);

	return (
		<div className="column" style={{justifyContent:'space-around', gap:'0'}}>
			<div className="row" style={{height:'60%'}}>
				<LinearGauge
					width={store.contentSize.width - applicationSettings.constants.padding}
					height={store.contentSize.height * 0.4}
					padding={applicationSettings.app.dashboardPadding.value}
					numberOfRectangles={50}
					spacing={5}
					ticks={9}
					smallTicks={3}
					decimals={2}
					unit1={sensorSettings[applicationSettings.dash_race.progress_1.value].unit}
					unit2={sensorSettings[applicationSettings.dash_race.progress_2.value].unit}
					value1={carData[applicationSettings.dash_race.progress_1.value]}
					value2={carData[applicationSettings.dash_race.progress_2.value]}
					limitValue2={1.0}
					maxValue={sensorSettings[applicationSettings.dash_race.progress_1.value].max_value}
					limitStart={sensorSettings[applicationSettings.dash_race.progress_1.value].limit_start}
					progressColor={'var(--themeDefault)'}
					textColor={'var(--textColorDefault)'}
					limitColor={'var(--themeAccent)'}
					indicatorColor={'var(--textColorDefault)'}
					backgroundColor={'var(--boxColorDark)'}
					svgMask={'/assets/svg/progress.svg'}
				/>
			</div>
			<div className="row">
				<div className="column">
					<ValueBox
						valueKey={applicationSettings.dash_race.value_1.value}
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
						valueKey={applicationSettings.dash_race.value_2.value}
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
						valueKey={applicationSettings.dash_race.value_3.value}
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
			</div>
			<div className="row">
				<div className="column">
					<ValueBox
						valueKey={applicationSettings.dash_race.value_4.value}
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
						valueKey={applicationSettings.dash_race.value_5.value}
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
						valueKey={applicationSettings.dash_race.value_6.value}
						carData={carData}
						sensorSettings={sensorSettings}
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
			</div>
		</div>
	)
};


export default Race;