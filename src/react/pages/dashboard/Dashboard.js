import React, { Component } from 'react';
import { RadialGauge } from "react-canvas-gauges";
import { useState, useEffect } from 'react';

import './dashboard.scss';
import '../../components/themes.scss';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const Store = window.require('electron-store');
const store = new Store();
const theme = store.get("colorTheme");


const Dashboard = ({ settings }) => {

	useEffect(() => {
		ipcRenderer.on('msgFromBackground', (event, args) => { msgFromBackground(args) });
		ipcRenderer.send('startScript', {});
		loadTheme();

		return function cleanup() {
			ipcRenderer.send('stopScript', {});
			ipcRenderer.removeAllListeners();
		};
	}, []);

	const msgFromBackground = (args) => {
		if(args !=null)
			console.log("Debug: ", args);

		if (args.includes("map:")) {
			args = args.replace("map:", "")
			setBoost(args);
		}
		if (args.includes("iat:")) {
			args = args.replace("iat:", "")
			setIntake(args);
		}
		if (args.includes("col:")) {
			args = args.replace("col:", "")
			setCoolant(args);
		}
		if (args.includes("vol:")) {
			args = args.replace("vol:", "")
			setVoltage(args);
		}
	}

	const [loaded, setLoaded] = useState(false);

	const [boost, setBoost] = useState(0);
	const [intake, setIntake] = useState(0);
	const [coolant, setCoolant] = useState(0);
	const [voltage, setVoltage] = useState(0);

	const [gaugeBoost, setGaugeBoost] = useState(settings.showGaugeBoost);
	const [gaugeIntake, setGaugeIntake] = useState(settings.showGaugeIntake);
	const [gaugeCoolant, setGaugeCoolant] = useState(settings.showGaugeCoolant);


	const [colorPlate, setColorPlate] = useState(null);
	const [colorPlateEnd, setColorPlateEnd] = useState(null);

	const [colorTitle, setColorTitle] = useState(null);
	const [colorUnits, setColorUnits] = useState(null);
	const [colorHighlight, setColorHighlight] = useState(null);

	const [colorMinorTicks, setColorMinorTicks] = useState(null);
	const [colorMajorTicks, setColorMajorTicks] = useState(null);
	const [colorNumbers, setColorNumbers] = useState(null);

	const [colorNeedle, setColorNeedle] = useState(null);
	const [colorNeedleEnd, setColorNeedleEnd] = useState(null);
	const [colorNeedleShadowUp, setColorNeedleShadowUp] = useState(null);
	const [colorNeedleShadowDown, setColorNeedleShadowDown] = useState(null);

	const [colorNeedleCircleInner, setColorNeedleCircleInner] = useState(null);
	const [colorNeedleCircleInnerEnd, setColorNeedleCircleInnerEnd] = useState(null);
	const [colorNeedleCircleOuter, setColorNeedleCircleOuter] = useState(null);
	const [colorNeedleCircleOuterEnd, setColorNeedleCircleOuterEnd] = useState(null);

	const [colorBorderOuter, setColorBorderOuter] = useState(null);
	const [colorBorderMiddle, setColorBorderMiddle] = useState(null);
	const [colorBorderInner, setColorBorderInner] = useState(null);
	const [colorBorderOuterEnd, setColorBorderOuterEnd] = useState(null);
	const [colorBorderMiddleEnd, setColorBorderMiddleEnd] = useState(null);
	const [colorBorderInnerEnd, setColorBorderInnerEnd] = useState(null);

	function loadTheme() {
		let style = getComputedStyle(document.querySelector(".dashboard"));

		setColorPlate(style.getPropertyValue("--colorPlate"));
		setColorPlateEnd(style.getPropertyValue("--colorPlateEnd"));

		setColorTitle(style.getPropertyValue("--colorTitle"));
		setColorUnits(style.getPropertyValue("--colorUnits"));
		setColorHighlight(style.getPropertyValue("--colorHighlight"));

		setColorMinorTicks(style.getPropertyValue("--colorMinorTicks"));
		setColorMajorTicks(style.getPropertyValue("--colorMajorTicks"));
		setColorNumbers(style.getPropertyValue("--colorNumbers"));

		setColorNeedle(style.getPropertyValue("--colorNeedle"));
		setColorNeedleEnd(style.getPropertyValue("--colorNeedleEnd"));
		setColorNeedleShadowUp(style.getPropertyValue("--colorNeedleShadowUp"));
		setColorNeedleShadowDown(style.getPropertyValue("--colorNeedleShadowDown"));

		setColorNeedleCircleInner(style.getPropertyValue("--colorNeedleCircleInner"));
		setColorNeedleCircleInnerEnd(style.getPropertyValue("--colorNeedleCircleInnerEnd"));
		setColorNeedleCircleOuter(style.getPropertyValue("--colorNeedleCircleOuter"));
		setColorNeedleCircleOuterEnd(style.getPropertyValue("--colorNeedleCircleOuterEnd"));


		setColorBorderOuter(style.getPropertyValue("--colorBorderOuter"));
		setColorBorderMiddle(style.getPropertyValue("--colorBorderMiddle"));
		setColorBorderInner(style.getPropertyValue("--colorBorderInner"));
		setColorBorderOuterEnd(style.getPropertyValue("--colorBorderOuterEnd"));
		setColorBorderMiddleEnd(style.getPropertyValue("--colorBorderMiddleEnd"));
		setColorBorderInnerEnd(style.getPropertyValue("--colorBorderInnerEnd"));

		setLoaded(true);
	}



	return (
		<div className={`dashboard ${settings.colorTheme}`}>
			<div className="dashboard__header">
			</div>
			{loaded ?
			<div className="dashboard__gauges">
				{gaugeBoost ?
					<RadialGauge
						width={250}
						height={250}
						units='bar'
						title='Boost'
						value={boost}
						minValue={0}
						maxValue={1.5}
						majorTicks={['0', '0.3', '0.6', '0.9', '1.2', '1.5']}
						minorTicks={2}

						//custom config:

						needleType='line'
						needleStart={0}
						needleCircleSize={13}

						borderInnerWidth={0}
						borderMiddleWidth={2}
						borderOuterWidth={7}

						valueBox={false}

						
						colorPlate={colorPlate}
						colorPlateEnd={colorPlateEnd}

						colorTitle={colorTitle}
						colorUnits={colorUnits}
						colorHighlight={colorHighlight}

						
						colorMinorTicks={colorMinorTicks}
						colorMajorTicks={colorMajorTicks}
						colorNumbers={colorNumbers}

						colorNeedle={colorNeedle}
						colorNeedleEnd={colorNeedleEnd}
						colorNeedleShadowUp={colorNeedleShadowUp}
						colorNeedleShadowDown={colorNeedleShadowDown}

						
						colorNeedleCircleInner={colorNeedleCircleInner}
						colorNeedleCircleInnerEnd={colorNeedleCircleInnerEnd}
						colorNeedleCircleOuter={colorNeedleCircleOuter}
						colorNeedleCircleOuterEnd={colorNeedleCircleOuterEnd}

						
						colorBorderOuter={colorBorderOuter}
						colorBorderMiddle={colorBorderMiddle}
						colorBorderInner={colorBorderInner}

						
						colorBorderOuterEnd={colorBorderOuterEnd}
						colorBorderMiddleEnd={colorBorderMiddleEnd}
						colorBorderInnerEnd={colorBorderInnerEnd}
						

						highlights={[{}]}
					></RadialGauge>

					: <div></div>}

				{gaugeIntake ?
					<RadialGauge
						width={250}
						height={250}
						units='°C'
						title='Intake'
						value={intake}
						minValue={0}
						maxValue={90}
						majorTicks={['0', '30', '60', '90']}
						minorTicks={3}

						//custom config:

						needleType='line'
						needleStart={0}
						needleCircleSize={13}

						borderInnerWidth={0}
						borderMiddleWidth={2}
						borderOuterWidth={7}

						valueBox={false}

						
						colorPlate={colorPlate}
						colorPlateEnd={colorPlateEnd}

						colorTitle={colorTitle}
						colorUnits={colorUnits}
						colorHighlight={colorHighlight}

						colorMinorTicks={colorMinorTicks}
						colorMajorTicks={colorMajorTicks}
						colorNumbers={colorNumbers}

						
						colorNeedle={colorNeedle}
						colorNeedleEnd={colorNeedleEnd}
						colorNeedleShadowUp={colorNeedleShadowUp}
						colorNeedleShadowDown={colorNeedleShadowDown}

						colorNeedleCircleInner={colorNeedleCircleInner}
						colorNeedleCircleInnerEnd={colorNeedleCircleInnerEnd}
						colorNeedleCircleOuter={colorNeedleCircleOuter}
						colorNeedleCircleOuterEnd={colorNeedleCircleOuterEnd}

						colorBorderOuter={colorBorderOuter}
						colorBorderMiddle={colorBorderMiddle}
						colorBorderInner={colorBorderInner}

						colorBorderOuterEnd={colorBorderOuterEnd}
						colorBorderMiddleEnd={colorBorderMiddleEnd}
						colorBorderInnerEnd={colorBorderInnerEnd}
						

						highlights={[{
							"from": 60,
							"to": 90,
							"color": colorHighlight
						}]}

					></RadialGauge>
					: <div></div>}

				{gaugeCoolant ?
					<RadialGauge
						width={250}
						height={250}
						units='°C'
						title='Coolant'
						value={coolant}
						minValue={0}
						maxValue={150}
						majorTicks={['0', '50', '100', '150']}
						minorTicks={5}

						//custom config:

						needleType='line'
						needleStart={0}
						needleCircleSize={13}

						borderInnerWidth={0}
						borderMiddleWidth={2}
						borderOuterWidth={7}

						valueBox={false}

						
						colorPlate={colorPlate}
						colorPlateEnd={colorPlateEnd}

						colorTitle={colorTitle}
						colorUnits={colorUnits}
						colorHighlight={colorHighlight}

						colorMinorTicks={colorMinorTicks}
						colorMajorTicks={colorMajorTicks}
						colorNumbers={colorNumbers}

						colorNeedle={colorNeedle}
						colorNeedleEnd={colorNeedleEnd}
						colorNeedleShadowUp={colorNeedleShadowUp}
						colorNeedleShadowDown={colorNeedleShadowDown}

						colorNeedleCircleInner={colorNeedleCircleInner}
						colorNeedleCircleInnerEnd={colorNeedleCircleInnerEnd}
						colorNeedleCircleOuter={colorNeedleCircleOuter}
						colorNeedleCircleOuterEnd={colorNeedleCircleOuterEnd}

						colorBorderOuter={colorBorderOuter}
						colorBorderMiddle={colorBorderMiddle}
						colorBorderInner={colorBorderInner}

						colorBorderOuterEnd={colorBorderOuterEnd}
						colorBorderMiddleEnd={colorBorderMiddleEnd}
						colorBorderInnerEnd={colorBorderInnerEnd}
						

						highlights={[{
							"from": 120,
							"to": 150,
							"color": colorHighlight
						}]}
					></RadialGauge>
					: <div></div>}
			</div> : <></> }
			<div className="dashboard__footer">
				{settings.activateCAN ? <div><h3>{voltage}V</h3></div> : <div><h3><i>(CAN-Stream deactivated.)</i></h3></div>}
			</div>
		</div>
	)
};

export default Dashboard;