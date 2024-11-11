import "./../../../../styles.scss"
import "./../../../../themes.scss"

import ValueBox from './../../../components/ValueBox';
import LinearGauge from './../../../components/LinearGauge';
import { APP } from '../../../../store/Store';


const Race = () => {
	const app = APP((state) => state);

	return (
		<div className="column" style={{ justifyContent: 'space-around', gap: '0' }}>
			<div className="row" style={{ height: '60%' }}>
				<LinearGauge
					sensor1={app.settings.dash_race.progress_1.value}
					type1={app.settings.dash_race.progress_1.type}

					sensor2={app.settings.dash_race.progress_2.value}
					type2={app.settings.dash_race.progress_2.type}

					width={app.system.contentSize.width - app.settings.constants.padding}
					height={app.system.contentSize.height * 0.4}
					padding={app.settings.general.dashboardPadding.value}
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
						sensor={app.settings.dash_race.value_1.value}
						type={app.settings.dash_race.value_1.type}
						
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

						labelSize={`calc(3vh * ${app.settings.textScale}`}
						valueSize={`calc(6vh * ${app.settings.textScale}`}
					/>

				</div>
				<div className="column">
					<ValueBox
						sensor={app.settings.dash_race.value_2.value}
						type={app.settings.dash_race.value_2.type}

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

						labelSize={`calc(3vh * ${app.settings.textScale}`}
						valueSize={`calc(6vh * ${app.settings.textScale}`}
					/>
				</div>
				<div className="column">
					<ValueBox
						sensor={app.settings.dash_race.value_3.value}
						type={app.settings.dash_race.value_3.type}

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

						labelSize={`calc(3vh * ${app.settings.textScale}`}
						valueSize={`calc(6vh * ${app.settings.textScale}`}
					/>
				</div>
			</div>
			<div className="row">
				<div className="column">
					<ValueBox
						sensor={app.settings.dash_race.value_4.value}
						type={app.settings.dash_race.value_4.type}

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

						labelSize={`calc(3vh * ${app.settings.textScale}`}
						valueSize={`calc(6vh * ${app.settings.textScale}`}
					/>
				</div>
				<div className="column">
					<ValueBox
						sensor={app.settings.dash_race.value_5.value}
						type={app.settings.dash_race.value_5.type}

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

						labelSize={`calc(3vh * ${app.settings.textScale}`}
						valueSize={`calc(6vh * ${app.settings.textScale}`}
					/>
				</div>
				<div className="column">
					<ValueBox
						sensor={app.settings.dash_race.value_6.value}
						type={app.settings.dash_race.value_6.type}

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

						labelSize={`calc(3vh * ${app.settings.textScale}`}
						valueSize={`calc(6vh * ${app.settings.textScale}`}
					/>
				</div>
			</div>
		</div>
	)
};


export default Race;