import React, { Component } from 'react';
import { RadialGauge } from "react-canvas-gauges";
import './dashboard.scss';
import '../../components/themes.scss';

const electron = window.require('electron');
const { ipcRenderer } = electron;

const Store = window.require('electron-store');
const store = new Store();
const theme = store.get("colorTheme");

let gaugeBoost = false;
let gaugeIntake = false;
let gaugeCoolant = false;

class Dashboard extends Component {
	constructor(props) {
		super();

		this.state = {
			boost: 0,
			intake: 0,
			coolant: 0,
			voltage: 0,

			theme: null,

			colorPlate: '#000000',
			colorPlateEnd: '#000000',

			colorTitle: '#000000',
			colorUnits: '#000000',
			colorHighlight: '#000000',

			colorMinorTicks: '#000000',
			colorMajorTicks: '#000000',
			colorNumbers: '#000000',

			colorNeedle: '#000000',
			colorNeedleEnd: '#000000',
			colorNeedleShadowUp: '#000000',
			colorNeedleShadowDown: '#000000',

			colorNeedleCircleInner: '#000000',
			colorNeedleCircleInnerEnd: '#000000',
			colorNeedleCircleOuter: '#000000',
			colorNeedleCircleOuterEnd: '#000000',

			colorBorderOuter: '#000000',
			colorBorderMiddle: '#000000',
			colorBorderInner: '#000000',
			colorBorderOuterEnd: '#000000',
			colorBorderMiddleEnd: '#000000',
			colorBorderInnerEnd: '#000000'
		};

		this.loadTheme = this.loadTheme.bind(this);
	}

	msgFromBG = (event, args) => {
		if (this.ismounted) {
			if (args.includes("map:")) {
				args = args.replace("map:", "")
				this.setState({
					boost: args
				});
			}
			if (args.includes("iat:")) {
				args = args.replace("iat:", "")
				this.setState({
					intake: args
				});
			}
			if (args.includes("col:")) {
				args = args.replace("col:", "")
				this.setState({
					coolant: args
				});
			}
			if (args.includes("vol:")) {
				args = args.replace("vol:", "")
				this.setState({
					voltage: args
				});
			}
		}
	}

	componentDidMount() {
		this.ismounted = true;
		this.loadTheme();

		gaugeBoost = store.get("showGaugeBoost");
		gaugeIntake = store.get("showGaugeIntake");
		gaugeCoolant = store.get("showGaugeCoolant");

		ipcRenderer.on('msgFromBackground', this.msgFromBG);
	}

	componentWillUnmount() {
		this.ismounted = false;
		ipcRenderer.removeListener('msgFromBackground', this.msgFromBG);
	}

	loadTheme() {
		let style = getComputedStyle(document.querySelector(".dashboard"));

		this.setState({
			colorPlate: style.getPropertyValue("--colorPlate"),
			colorPlateEnd: style.getPropertyValue("--colorPlateEnd"),

			colorTitle: style.getPropertyValue("--colorTitle"),
			colorUnits: style.getPropertyValue("--colorUnits"),
			colorHighlight: style.getPropertyValue("--colorHighlight"),

			colorMinorTicks: style.getPropertyValue("--colorMinorTicks"),
			colorMajorTicks: style.getPropertyValue("--colorMajorTicks"),
			colorNumbers: style.getPropertyValue("--colorNumbers"),

			colorNeedle: style.getPropertyValue("--colorNeedle"),
			colorNeedleEnd: style.getPropertyValue("--colorNeedleEnd"),
			colorNeedleShadowUp: style.getPropertyValue("--colorNeedleShadowUp"),
			colorNeedleShadowDown: style.getPropertyValue("--colorNeedleShadowDown"),

			colorNeedleCircleInner: style.getPropertyValue("--colorNeedleCircleInner"),
			colorNeedleCircleInnerEnd: style.getPropertyValue("--colorNeedleCircleInnerEnd"),
			colorNeedleCircleOuter: style.getPropertyValue("--colorNeedleCircleOuter"),
			colorNeedleCircleOuterEnd: style.getPropertyValue("--colorNeedleCircleOuterEnd"),


			colorBorderOuter: style.getPropertyValue("--colorBorderOuter"),
			colorBorderMiddle: style.getPropertyValue("--colorBorderMiddle"),
			colorBorderInner: style.getPropertyValue("--colorBorderInner"),
			colorBorderOuterEnd: style.getPropertyValue("--colorBorderOuterEnd"),
			colorBorderMiddleEnd: style.getPropertyValue("--colorBorderMiddleEnd"),
			colorBorderInnerEnd: style.getPropertyValue("--colorBorderInnerEnd")
		});
	}

	render() {
		return <div className={`dashboard ${theme}`}>
			<div className="dashboard__header">
			</div>
			<div className="dashboard__gauges">

				{gaugeBoost ?
					<RadialGauge
						width={250}
						height={250}
						units='bar'
						title='Boost'
						value={this.state.boost}
						minValue={0}
						maxValue={1.5}
						majorTicks={['0', '0.3', '0.6', '0.9', '1.2', '1.5']}
						minorTicks={2}

						//custom config:
						valueBox={false}

						colorPlate={this.state.colorPlate}
						colorPlateEnd={this.state.colorPlateEnd}

						colorTitle={this.state.colorTitle}
						colorUnits={this.state.colorUnits}
						colorHighlight={this.state.colorHighlight}

						colorMinorTicks={this.state.colorMinorTicks}
						colorMajorTicks={this.state.colorMajorTicks}
						colorNumbers={this.state.colorNumbers}

						colorNeedle={this.state.colorNeedleEnd}
						colorNeedleEnd={this.state.colorNeedleEnd}
						colorNeedleShadowUp={this.state.colorNeedleShadowUp}
						colorNeedleShadowDown={this.state.colorNeedleShadowDown}


						needleType='line'
						needleStart={0}
						needleCircleSize={13}

						colorNeedleCircleInner={this.state.colorNeedleCircleInner}
						colorNeedleCircleInnerEnd={this.state.colorNeedleCircleInnerEnd}
						colorNeedleCircleOuter={this.state.colorNeedleCircleOuter}
						colorNeedleCircleOuterEnd={this.state.colorNeedleCircleOuterEnd}


						borderInnerWidth={0}
						borderMiddleWidth={2}
						borderOuterWidth={7}

						colorBorderOuter={this.state.colorBorderOuter}
						colorBorderMiddle={this.state.colorBorderMiddle}
						colorBorderInner={this.state.colorBorderInner}

						colorBorderOuterEnd={this.state.colorBorderOuterEnd}
						colorBorderMiddleEnd={this.state.colorBorderMiddleEnd}
						colorBorderInnerEnd={this.state.colorBorderInnerEnd}

						highlights={[{}]}
					></RadialGauge>

					: <div></div>}

				{gaugeIntake ?
					<RadialGauge
						width={250}
						height={250}
						units='°C'
						title='Intake'
						value={this.state.intake}
						minValue={0}
						maxValue={90}
						majorTicks={['0', '30', '60', '90']}
						minorTicks={3}

						//custom config:
						valueBox={false}

						colorPlate={this.state.colorPlate}
						colorPlateEnd={this.state.colorPlateEnd}

						colorTitle={this.state.colorTitle}
						colorUnits={this.state.colorUnits}
						colorHighlight={this.state.colorHighlight}

						colorMinorTicks={this.state.colorMinorTicks}
						colorMajorTicks={this.state.colorMajorTicks}
						colorNumbers={this.state.colorNumbers}

						colorNeedle={this.state.colorNeedleEnd}
						colorNeedleEnd={this.state.colorNeedleEnd}
						colorNeedleShadowUp={this.state.colorNeedleShadowUp}
						colorNeedleShadowDown={this.state.colorNeedleShadowDown}


						needleType='line'
						needleStart={0}
						needleCircleSize={13}

						colorNeedleCircleInner={this.state.colorNeedleCircleInner}
						colorNeedleCircleInnerEnd={this.state.colorNeedleCircleInnerEnd}
						colorNeedleCircleOuter={this.state.colorNeedleCircleOuter}
						colorNeedleCircleOuterEnd={this.state.colorNeedleCircleOuterEnd}


						borderInnerWidth={0}
						borderMiddleWidth={2}
						borderOuterWidth={7}

						colorBorderOuter={this.state.colorBorderOuter}
						colorBorderMiddle={this.state.colorBorderMiddle}
						colorBorderInner={this.state.colorBorderInner}

						colorBorderOuterEnd={this.state.colorBorderOuterEnd}
						colorBorderMiddleEnd={this.state.colorBorderMiddleEnd}
						colorBorderInnerEnd={this.state.colorBorderInnerEnd}

						highlights={[{
							"from": 60,
							"to": 90,
							"color": this.state.colorHighlight
						}]}

					></RadialGauge>
					: <div></div>}

				{gaugeCoolant ?
					<RadialGauge
						width={250}
						height={250}
						units='°C'
						title='Coolant'
						value={this.state.coolant}
						minValue={0}
						maxValue={150}
						majorTicks={['0', '50', '100', '150']}
						minorTicks={5}

						//custom config:
						valueBox={false}

						colorPlate={this.state.colorPlate}
						colorPlateEnd={this.state.colorPlateEnd}

						colorTitle={this.state.colorTitle}
						colorUnits={this.state.colorUnits}
						colorHighlight={this.state.colorHighlight}

						colorMinorTicks={this.state.colorMinorTicks}
						colorMajorTicks={this.state.colorMajorTicks}
						colorNumbers={this.state.colorNumbers}

						colorNeedle={this.state.colorNeedleEnd}
						colorNeedleEnd={this.state.colorNeedleEnd}
						colorNeedleShadowUp={this.state.colorNeedleShadowUp}
						colorNeedleShadowDown={this.state.colorNeedleShadowDown}


						needleType='line'
						needleStart={0}
						needleCircleSize={13}

						colorNeedleCircleInner={this.state.colorNeedleCircleInner}
						colorNeedleCircleInnerEnd={this.state.colorNeedleCircleInnerEnd}
						colorNeedleCircleOuter={this.state.colorNeedleCircleOuter}
						colorNeedleCircleOuterEnd={this.state.colorNeedleCircleOuterEnd}


						borderInnerWidth={0}
						borderMiddleWidth={2}
						borderOuterWidth={7}

						colorBorderOuter={this.state.colorBorderOuter}
						colorBorderMiddle={this.state.colorBorderMiddle}
						colorBorderInner={this.state.colorBorderInner}

						colorBorderOuterEnd={this.state.colorBorderOuterEnd}
						colorBorderMiddleEnd={this.state.colorBorderMiddleEnd}
						colorBorderInnerEnd={this.state.colorBorderInnerEnd}

						highlights={[{
							"from": 120,
							"to": 150,
							"color": this.state.colorHighlight
						}]}
					></RadialGauge>
					: <div></div>}
			</div>
			<div className="dashboard__footer">
				{store.get("activateCAN") ? <div><h3>{this.state.voltage}V</h3></div> : <div><h3><i>(CAN-Stream deactivated.)</i></h3></div>}
			</div>
		</div>;
	}

}

export default Dashboard;
