import { useState, useEffect, useMemo } from 'react'
import { APP } from '../../../../store/Store';

import RadialGauge from '../../../components/RadialGauge'
import ValueBox from '../../../components/ValueBox'

import "./../../../../styles.scss"
import "./../../../../themes.scss"



const Classic = () => {
	const app = APP((state) => state);

	const gaugeSize = 0.75 // 0.1 - 1.0 -> Percentage of parent div height
	const gauges = 3
	const [size, setSize] = useState(0);

	useEffect(() => {
		const width = (app.system.contentSize.width - (app.settings.general.contentPadding.value * 2)) / gauges
		const height = (app.system.contentSize.height  - (app.settings.general.contentPadding.value * 2)) * gaugeSize

		if (width <= height) {
			setSize(width)
		} else if (width >= height) {
			setSize(height)
		}
	}, [app.system.contentSize, app.settings.general.contentPadding.value])


	return (
		<>
			<div className="row">
				<div className="column">
					<RadialGauge
						sensor={app.settings.dash_classic.gauge_1.value}
						type={app.settings.dash_classic.gauge_1.type}

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
						backgroundColor={'var(--coldGreyDark)'}
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
						sensor={app.settings.dash_classic.gauge_2.value}
						type={app.settings.dash_classic.gauge_2.type}


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
						backgroundColor={'var(--coldGreyDark)'}
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
						sensor={app.settings.dash_classic.gauge_3.value}
						type={app.settings.dash_classic.gauge_3.type}


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
						backgroundColor={'var(--coldGreyDark)'}
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
						sensor={app.settings.dash_classic.value_1.value}
						type={app.settings.dash_classic.value_1.type}

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
				<div className="column">
				<ValueBox
						sensor={app.settings.dash_classic.value_2.value}
						type={app.settings.dash_classic.value_2.type}

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
				<div className="column">
				<ValueBox
						sensor={app.settings.dash_classic.value_3.value}
						type={app.settings.dash_classic.value_3.type}

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
			</div >
		</>
	)
};


export default Classic;