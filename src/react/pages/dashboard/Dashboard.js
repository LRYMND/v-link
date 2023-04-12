import React from 'react';
import { useState, useEffect } from 'react';

import RadialGauge from '../../components/RadialGauge'

import "../../themes.scss";
import './dashboard.scss';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const Dashboard = ({ settings, boost, intake, coolant, voltage }) => {

	useEffect(() => {
		loadTheme();
	}, []);

	const [loaded, setLoaded] = useState(false);
	const [colorNeedle, setColorNeedle] = useState(null);

	const [textColor, setTextColor] = useState(null);
	const [textColorActive, setTextColorActive] = useState(null);

	const [fillActive, setFillActive] = useState(null);
	const [fillInactive, setFillInactive] = useState(null);

	const [sectionColor, setSectionColor] = useState(null);


	function loadTheme() {
		let style = getComputedStyle(document.querySelector(".dashboard"));

		setSectionColor(style.getPropertyValue("--sectionColor"));
		setColorNeedle(style.getPropertyValue("--colorNeedle"));
		setTextColor(style.getPropertyValue("--textColor"));
		setTextColorActive(style.getPropertyValue("--textColorActive"));
		setFillActive(style.getPropertyValue("--fillActive"));
		setFillInactive(style.getPropertyValue("--fillInactive"));

		setLoaded(true);
	}

	return (
		<div className={`dashboard ${settings.colorTheme}`}>
			<div className="dashboard__header">
			</div>
			{loaded ?
				<div className="dashboard__gauges">
					{settings.showGaugeIntake ?
						<RadialGauge
							globalRotation={90}
							currentValue={intake}
							maxValue={90}
							size={110}
							progressRadius={70}
							progressWidth={5}
							limitRadius={80}
							limitWidth={2}
							limitStart={60}
							tickWidth={2}
							bigTicks={3}
							smallTicks={4}
							heightBigTicks={10}
							heightSmallTicks={3}
							needleLength={65}
							needleWidth={2}
							title="Intake"
							unit="°C"
							progressBackgroundColor={fillInactive}
							progressFillerColor={fillActive}
							tickColor={fillInactive}
							limitColor={colorNeedle}
							needleColor={colorNeedle}
							textColor1={fillInactive}
							textColor2={textColorActive}
							pivotColor={sectionColor}
							borderSize={1}
    						borderGap={5}
							borderColor={sectionColor}
						/>
						: <div></div>}
					{settings.showGaugeBoost ?

						<RadialGauge
							globalRotation={90}
							currentValue={boost}
							maxValue={1.6}
							size={120}
							progressRadius={90}
							progressWidth={5}
							limitRadius={100}
							limitWidth={2}
							limitStart={1.0}
							tickWidth={2}
							bigTicks={3}
							smallTicks={4}
							heightBigTicks={10}
							heightSmallTicks={3}
							needleLength={80}
							needleWidth={2}
							title="Boost"
							unit="Bar"
							progressBackgroundColor={fillInactive}
							progressFillerColor={fillActive}
							tickColor={fillInactive}
							limitColor={colorNeedle}
							needleColor={colorNeedle}
							textColor1={fillInactive}
							textColor2={textColorActive}
							pivotColor={sectionColor}
							borderSize={1}
    						borderGap={5}
							borderColor={sectionColor}
						/>
						: <div></div>}
					{settings.showGaugeCoolant ?
						<RadialGauge
							globalRotation={90}
							currentValue={coolant}
							maxValue={150}
							size={110}
							progressRadius={70}
							progressWidth={5}
							limitRadius={80}
							limitWidth={2}
							limitStart={100}
							tickWidth={2}
							bigTicks={3}
							smallTicks={4}
							heightBigTicks={10}
							heightSmallTicks={3}
							needleLength={65}
							needleWidth={2}
							title="Coolant"
							unit="°C"
							progressBackgroundColor={fillInactive}
							progressFillerColor={fillActive}
							tickColor={fillInactive}
							limitColor={colorNeedle}
							needleColor={colorNeedle}
							textColor1={fillInactive}
							textColor2={textColorActive}
							pivotColor={sectionColor}
							borderSize={1}
    						borderGap={5}
							borderColor={sectionColor}
						/>
						: <div></div>}
				</div> : <></>}
			<div className="dashboard__footer">
				{settings.activateCAN ? <div><h3>{voltage}V</h3></div> : <div><h3><i>(CAN-Stream deactivated.)</i></h3></div>}
			</div>
		</div>
	)
};

export default Dashboard;