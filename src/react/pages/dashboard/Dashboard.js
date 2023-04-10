import React from 'react';
import { useState, useEffect } from 'react';

import './dashboard.scss';
import '../../components/themes.scss';

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
	const [fillInctive, setFillInactive] = useState(null);


	function loadTheme() {
		let style = getComputedStyle(document.querySelector(".dashboard"));

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
					{settings.showGaugeBoost ?
						<rockiot-ui
							id="radial_1"
							serial="radial_1"
							type="gauge"
							variation="radial"
							orientation="vertical"
							name="Boost"
							value={boost}
							units="Bar"
							min="0"
							max="2"
							precision="2"
							animation="500"
							svgwidth="250"
							svgheight="250"
							text-color={textColor}
							value-color={textColor}
							value-bg="transparent"
							value-border="0px solid #000000"
							control-bg="none"
							startangle="45"
							endangle="135"
							radius="lg"
							size="md"
							scale="1"
							smallscale="1"
							ticks="2"
							needle="1"
							bar-color={fillInctive}
							progress-color={fillActive}
							scale-color={textColorActive}
							scale-text-color={textColorActive}
							needle-color={colorNeedle}
							needle-stroke={colorNeedle}
						></rockiot-ui>
						: <div></div>}
					{settings.showGaugeIntake ?
						<rockiot-ui
							id="radial_1"
							serial="radial_1"
							type="gauge"
							variation="radial"
							orientation="vertical"
							name="Intake"
							value={intake}
							units="°C"
							min="0"
							max="90"
							precision="2"
							animation="500"
							svgwidth="250"
							svgheight="250"
							text-color={textColor}
							value-color={textColor}
							value-bg="transparent"
							value-border="0px solid #000000"
							control-bg="none"
							startangle="45"
							endangle="135"
							radius="lg"
							size="md"
							scale="1"
							smallscale="1"
							ticks="2"
							needle="1"
							bar-color={fillInctive}
							progress-color={fillActive}
							scale-color={textColorActive}
							scale-text-color={textColorActive}
							needle-color={colorNeedle}
							needle-stroke={colorNeedle}
						></rockiot-ui>
						: <div></div>}
					{settings.showGaugeCoolant ?
						<rockiot-ui
							id="radial_1"
							serial="radial_1"
							type="gauge"
							variation="radial"
							orientation="vertical"
							name="Coolant"
							value={coolant}
							units="°C"
							min="0"
							max="150"
							precision="2"
							animation="500"
							svgwidth="250"
							svgheight="250"
							text-color={textColor}
							value-color={textColor}
							value-bg="transparent"
							value-border="0px solid #000000"
							control-bg="none"
							startangle="45"
							endangle="135"
							radius="lg"
							size="md"
							scale="1"
							smallscale="1"
							ticks="2"
							needle="1"
							bar-color={fillInctive}
							progress-color={fillActive}
							scale-color={textColorActive}
							scale-text-color={textColorActive}
							needle-color={colorNeedle}
							needle-stroke={colorNeedle}
						></rockiot-ui>
						: <div></div>}
				</div> : <></>}
			<div className="dashboard__footer">
				{settings.activateCAN ? <div><h3>{voltage}V</h3></div> : <div><h3><i>(CAN-Stream deactivated.)</i></h3></div>}
			</div>
		</div>
	)
};

export default Dashboard;