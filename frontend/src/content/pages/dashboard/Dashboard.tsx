import { useState, useEffect } from 'react';

import RadialGauge from '../../components/RadialGauge'

import "./../../../styles.scss"
import "./../../../themes.scss"
import './dashboard.scss';

const Dashboard = ({ canbusSettings, applicationSettings, carData }) => {

	useEffect(() => {
		loadTheme();
	}, []);


	const [loaded, setLoaded] = useState(false);
	const [colorNeedle, setColorNeedle] = useState(null);
	const [textColorActive, setTextColorActive] = useState(null);
	const [fillActive, setFillActive] = useState(null);
	const [fillInactive, setFillInactive] = useState(null);
	const [sectionColor, setSectionColor] = useState(null);


	function loadTheme() {
		const style = getComputedStyle(document.querySelector(".dashboard"));

		setSectionColor(style.getPropertyValue("--sectionColor"));
		setColorNeedle(style.getPropertyValue("--colorNeedle"));
		setTextColorActive(style.getPropertyValue("--textColorActive"));
		setFillActive(style.getPropertyValue("--fillActive"));
		setFillInactive(style.getPropertyValue("--fillInactive"));

		setLoaded(true);
	}


	return (
		<div className={`dashboard ${applicationSettings.app.colorTheme.value}`}>
			<div className="dashboard__header">
			</div>
			{loaded && canbusSettings && applicationSettings ?
				<div className="dashboard__gauges">
					{applicationSettings.visibility.showGauge_1.value ?
						<RadialGauge
							currentValue={carData[applicationSettings.dash_1.gauge_1.value]}
							maxValue={canbusSettings.messages[applicationSettings.dash_1.gauge_1.value].max_value}
							limitStart={canbusSettings.messages[applicationSettings.dash_1.gauge_1.value].limit_start}
							title={canbusSettings.messages[applicationSettings.dash_1.gauge_1.value].label}
							unit={canbusSettings.messages[applicationSettings.dash_1.gauge_1.value].unit}

							globalRotation={90}
							size={110}
							progressRadius={70}
							progressWidth={5}
							limitRadius={80}
							limitWidth={2}
							tickWidth={2}
							bigTicks={3}
							smallTicks={4}
							heightBigTicks={10}
							heightSmallTicks={3}
							needleLength={65}
							needleWidth={2}
							borderSize={1}
							borderGap={5}

							progressBackgroundColor={fillInactive}
							progressFillerColor={fillActive}
							tickColor={fillInactive}
							limitColor={colorNeedle}
							needleColor={colorNeedle}
							textColor1={fillInactive}
							textColor2={textColorActive}
							pivotColor={sectionColor}
							borderColor={sectionColor}
						/>
						: <div></div>}
					{applicationSettings.visibility.showGauge_2.value ?

						<RadialGauge
							currentValue={carData[applicationSettings.dash_1.gauge_2.value]}
							maxValue={canbusSettings.messages[applicationSettings.dash_1.gauge_2.value].max_value}
							limitStart={canbusSettings.messages[applicationSettings.dash_1.gauge_2.value].limit_start}
							title={canbusSettings.messages[applicationSettings.dash_1.gauge_2.value].label}
							unit={canbusSettings.messages[applicationSettings.dash_1.gauge_2.value].unit}

							globalRotation={90}
							size={120}
							progressRadius={90}
							progressWidth={5}
							limitRadius={100}
							limitWidth={2}
							tickWidth={2}
							bigTicks={3}
							smallTicks={4}
							heightBigTicks={10}
							heightSmallTicks={3}
							needleLength={80}
							needleWidth={2}
							borderSize={1}
							borderGap={5}

							progressBackgroundColor={fillInactive}
							progressFillerColor={fillActive}
							tickColor={fillInactive}
							limitColor={colorNeedle}
							needleColor={colorNeedle}
							textColor1={fillInactive}
							textColor2={textColorActive}
							pivotColor={sectionColor}
							borderColor={sectionColor}
						/>
						: <div></div>}
					{applicationSettings.visibility.showGauge_3.value ?
						<RadialGauge
							currentValue={carData[applicationSettings.dash_1.gauge_3.value]}
							maxValue={canbusSettings.messages[applicationSettings.dash_1.gauge_3.value].max_value}
							limitStart={canbusSettings.messages[applicationSettings.dash_1.gauge_3.value].limit_start}
							title={canbusSettings.messages[applicationSettings.dash_1.gauge_3.value].label}
							unit={canbusSettings.messages[applicationSettings.dash_1.gauge_3.value].unit}

							globalRotation={90}
							size={110}
							progressRadius={70}
							progressWidth={5}
							limitRadius={80}
							limitWidth={2}
							tickWidth={2}
							bigTicks={3}
							smallTicks={4}
							heightBigTicks={10}
							heightSmallTicks={3}
							needleLength={65}
							needleWidth={2}
							borderSize={1}
							borderGap={5}

							progressBackgroundColor={fillInactive}
							progressFillerColor={fillActive}
							tickColor={fillInactive}
							limitColor={colorNeedle}
							needleColor={colorNeedle}
							textColor1={fillInactive}
							textColor2={textColorActive}
							pivotColor={sectionColor}
							borderColor={sectionColor}
						/>
						: <div></div>}
				</div> : <></>}
			<div className="footer">
				{loaded && applicationSettings && canbusSettings ?
					<>
						<div className="output">
							<div className="output__label">
								{canbusSettings.messages[applicationSettings.dash_1.value_1.value].label}:
							</div>
							<div className="output__data">
								{carData[applicationSettings.dash_1.value_1.value]}{canbusSettings.messages[applicationSettings.dash_1.value_1.value].unit}
							</div>
						</div>

						<div className="output">
							<div className="output__label">
								{canbusSettings.messages[applicationSettings.dash_1.value_2.value].label}:
							</div>
							<div className="output__data">
								{carData[applicationSettings.dash_1.value_2.value]}{canbusSettings.messages[applicationSettings.dash_1.value_2.value].unit}
							</div>
						</div>
						<div className="output">
							<div className="output__label">
								{canbusSettings.messages[applicationSettings.dash_1.value_3.value].label}:
							</div>
							<div className="output__data">
								{carData[applicationSettings.dash_1.value_3.value]}{canbusSettings.messages[applicationSettings.dash_1.value_3.value].unit}
							</div>
						</div>
					</> :
					<div className="output">
						<div className="output__label">
							<i>(CAN-Stream deactivated.)</i>
						</div>
					</div>
				}
			</div>
		</div>
	)
};


export default Dashboard;