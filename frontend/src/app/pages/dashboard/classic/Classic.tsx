import { useState, useEffect, useMemo } from 'react'
import { ApplicationSettings, Store } from '../../../../store/Store';

import RadialGauge from '../../../components/RadialGauge'
import ValueBox from '../../../components/ValueBox'

import "./../../../../styles.scss"
import "./../../../../themes.scss"



const Classic = () => {
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
						sensor={applicationSettings.dash_classic.gauge_1.value}

						globalRotation={90}
						size={size * 0.9}

						borderSize={1}
						borderGap={5}

						progressOffset={-30}
						progressWidth={5}

						limitOffset={-20}
						limitWidth={2}

						tickWidth={2}
						smallTicks={4}
						heightSmallTicks={3}
						bigTicks={3}
						heightBigTicks={10}

						needleOffset={-30}
						needleWidth={2}

						borderColor={'var(--boxColorDefault)'}
						backgroundColor={'black'}
						progressBackgroundColor={'var(--boxColorLighter)'}
						progressFillerColor={'var(--themeDefault)'}
						tickColor={'var(--boxColorLighter)'}
						limitColor={'var(--themeAccent)'}
						needleColor={'var(--themeAccent)'}
						textColor1={'var(--boxColorLighter)'}
						textColor2={'var(--themeDefault)'}
						pivotColor={'var(--boxColorDefault)'}
					/>
				</div>
				<div className="column">
				<RadialGauge
						sensor={applicationSettings.dash_classic.gauge_2.value}

						globalRotation={90}
						size={size * 0.9}

						borderSize={1}
						borderGap={5}

						progressOffset={-30}
						progressWidth={5}

						limitOffset={-20}
						limitWidth={2}

						tickWidth={2}
						smallTicks={4}
						heightSmallTicks={3}
						bigTicks={3}
						heightBigTicks={10}

						needleOffset={-30}
						needleWidth={2}

						borderColor={'var(--boxColorDefault)'}
						backgroundColor={'black'}
						progressBackgroundColor={'var(--boxColorLighter)'}
						progressFillerColor={'var(--themeDefault)'}
						tickColor={'var(--boxColorLighter)'}
						limitColor={'var(--themeAccent)'}
						needleColor={'var(--themeAccent)'}
						textColor1={'var(--boxColorLighter)'}
						textColor2={'var(--themeDefault)'}
						pivotColor={'var(--boxColorDefault)'}
					/>
				</div>
				<div className="column">
				<RadialGauge
						sensor={applicationSettings.dash_classic.gauge_3.value}

						globalRotation={90}
						size={size * 0.9}

						borderSize={1}
						borderGap={5}

						progressOffset={-30}
						progressWidth={5}

						limitOffset={-20}
						limitWidth={2}

						tickWidth={2}
						smallTicks={4}
						heightSmallTicks={3}
						bigTicks={3}
						heightBigTicks={10}

						needleOffset={-30}
						needleWidth={2}

						borderColor={'var(--boxColorDefault)'}
						backgroundColor={'black'}
						progressBackgroundColor={'var(--boxColorLighter)'}
						progressFillerColor={'var(--themeDefault)'}
						tickColor={'var(--boxColorLighter)'}
						limitColor={'var(--themeAccent)'}
						needleColor={'var(--themeAccent)'}
						textColor1={'var(--boxColorLighter)'}
						textColor2={'var(--themeDefault)'}
						pivotColor={'var(--boxColorDefault)'}
					/>
				</div>

			</div>
			<div className="row">
				<div className="column">
					<ValueBox
						sensor={applicationSettings.dash_classic.value_1.value}
						unit={true}

						textColorDefault={'var(--textColorDefault)'}
						valueColor={'var(--themeDefault)'}
						limitColor={'var(--themeAccent)'}
						boxColor={'var(--boxColorDarker)'}
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
						sensor={applicationSettings.dash_classic.value_2.value}
						unit={true}

						textColorDefault={'var(--textColorDefault)'}
						valueColor={'var(--themeDefault)'}
						limitColor={'var(--themeAccent)'}
						boxColor={'var(--boxColorDarker)'}
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
						sensor={applicationSettings.dash_classic.value_3.value}
						unit={true}

						textColorDefault={'var(--textColorDefault)'}
						valueColor={'var(--themeDefault)'}
						limitColor={'var(--themeAccent)'}
						boxColor={'var(--boxColorDarker)'}
						borderColor={'var(--boxColorDark)'}

						borderWidth={'.75vh'}
						style={"column"}

						height={"10vh"}
						width={"100%"}

						labelSize={`calc(3vh * ${store.textScale}`}
						valueSize={`calc(6vh * ${store.textScale}`}
					/>
				</div>
			</div >
		</>
	)
};


export default Classic;