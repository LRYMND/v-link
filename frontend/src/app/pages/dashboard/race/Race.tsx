import "./../../../../styles.scss"
import "./../../../../themes.scss"

import ValueBox from './../../../components/ValueBox';
import LinearGauge from './../../../components/LinearGauge';
import { ApplicationSettings, Store } from '../../../../store/Store';


const Race = () => {
	const applicationSettings = ApplicationSettings((state) => state.applicationSettings);
	const store = Store((state) => state);

	return (
		<div className="column" style={{ justifyContent: 'space-around', gap: '0' }}>
			<div className="row" style={{ height: '60%' }}>
				<LinearGauge
					sensor1={applicationSettings.dash_race.progress_1.value}
					sensor2={applicationSettings.dash_race.progress_2.value}
					width={store.contentSize.width - applicationSettings.constants.padding}
					height={store.contentSize.height * 0.4}
					padding={applicationSettings.app.dashboardPadding.value}
					numberOfRectangles={50}
					spacing={5}
					bigTicks={9}
					smallTicks={3}
					decimals={2}

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
						sensor={applicationSettings.dash_race.value_1.value}
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

						labelSize={`calc(3vh * ${store.textScale}`}
						valueSize={`calc(6vh * ${store.textScale}`}
					/>

				</div>
				<div className="column">
					<ValueBox
						sensor={applicationSettings.dash_race.value_2.value}
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

						labelSize={`calc(3vh * ${store.textScale}`}
						valueSize={`calc(6vh * ${store.textScale}`}
					/>
				</div>
				<div className="column">
					<ValueBox
						sensor={applicationSettings.dash_race.value_3.value}
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

						labelSize={`calc(3vh * ${store.textScale}`}
						valueSize={`calc(6vh * ${store.textScale}`}
					/>
				</div>
			</div>
			<div className="row">
				<div className="column">
					<ValueBox
						sensor={applicationSettings.dash_race.value_4.value}
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

						labelSize={`calc(3vh * ${store.textScale}`}
						valueSize={`calc(6vh * ${store.textScale}`}
					/>
				</div>
				<div className="column">
					<ValueBox
						sensor={applicationSettings.dash_race.value_5.value}
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

						labelSize={`calc(3vh * ${store.textScale}`}
						valueSize={`calc(6vh * ${store.textScale}`}
					/>
				</div>
				<div className="column">
					<ValueBox
						sensor={applicationSettings.dash_race.value_6.value}
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

						labelSize={`calc(3vh * ${store.textScale}`}
						valueSize={`calc(6vh * ${store.textScale}`}
					/>
				</div>
			</div>
		</div>
	)
};


export default Race;