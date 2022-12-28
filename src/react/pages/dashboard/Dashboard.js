import React, { Component } from 'react';
import { RadialGauge } from "react-canvas-gauges";
import './dashboard.scss';

const electron = window.require('electron');
const { ipcRenderer } = electron;

//let ismounted = false;


class Dashboard extends Component {
	constructor(props) {
		super();
		this.state = { boost: null };
		this.state = { intake: null };
		this.state = { coolant: null };
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
		}
	}

	componentDidMount() {
		this.ismounted = true;

		ipcRenderer.on('MESSAGE_FROM_BACKGROUND_VIA_MAIN', this.msgFromBG);

		ipcRenderer.send('START_BACKGROUND_VIA_MAIN', {
			//Message to BG Worker goes here
		});

	}

	componentWillUnmount() {
		this.ismounted = false;
		ipcRenderer.send('QUIT_BACKGROUND');

		ipcRenderer.removeListener('MESSAGE_FROM_BACKGROUND_VIA_MAIN', this.msgFromBG);
	}

	render() {
		return <div className="dashboard">
			<RadialGauge
				width={250}
				height={250}
				units='bar'
				title='Boost'
				value={this.state.boost}
				minValue={0}
				maxValue={2}
				majorTicks={['0', '0.2', '0.4', '0.6', '0.8', '1.0', '1.2', '1.4', '1.6', '1.8', '2.0']}
				minorTicks={2}

				//custom config:
				valueBox={false}

				colorPlate='#000000'
				colorPlateEnd='#121212'

				colorTitle='#ffffff'
				colorUnits='#ffffff'

				colorMinorTicks='#ffffff'
				colorMajorTicks='#ffffff'

				colorNumbers='#ffffff'

				colorNeedle='#1a80d2'
				colorNeedleEnd='#3f6baa'
				colorNeedleShadowUp='#d73230'
				colorNeedleShadowDown='#131c2e'

				needleType='line'
				needleStart={0}
				colorNeedleCircleInner='#282c35'
				colorNeedleCircleInnerEnd='#282c35'
				colorNeedleCircleOuter='#363a43'
				colorNeedleCircleOuterEnd='#282c35'
				needleCircleSize={13}

				borderInnerWidth={0}
				bordeeMiddleWidth={2}
				bordeeOuterWidth={7}

				colorBorderOuter='#777777'
				colorBorderMiddle='#777777'
				colorBorderInner='#777777'

				colorBorderOuterEnd='#777777'
				colorBorderMiddleEnd='#777777'
				colorBorderInnerEnd='#777777'

				highlights={[{}]}
			></RadialGauge>

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

				colorPlate='#000000'
				colorPlateEnd='#121212'

				colorTitle='#ffffff'
				colorUnits='#ffffff'

				colorMinorTicks='#ffffff'
				colorMajorTicks='#ffffff'

				colorNumbers='#ffffff'

				colorNeedle='#1a80d2'
				colorNeedleEnd='#3f6baa'
				colorNeedleShadowUp='#d73230'
				colorNeedleShadowDown='#131c2e'

				needleType='line'
				needleStart={0}
				colorNeedleCircleInner='#282c35'
				colorNeedleCircleInnerEnd='#282c35'
				colorNeedleCircleOuter='#363a43'
				colorNeedleCircleOuterEnd='#282c35'
				needleCircleSize={13}

				borderInnerWidth={0}
				bordeeMiddleWidth={2}
				bordeeOuterWidth={7}

				colorBorderOuter='#777777'
				colorBorderMiddle='#777777'
				colorBorderInner='#777777'

				colorBorderOuterEnd='#777777'
				colorBorderMiddleEnd='#777777'
				colorBorderInnerEnd='#777777'

				highlights={[{
					"from": 60,
					"to": 90,
					"color": '#4a5e7a'
				}]}

			></RadialGauge>

			<RadialGauge
				width={250}
				height={250}
				units='°C'
				title='Coolant'
				value={this.state.coolant}
				minValue={0}
				maxValue={150}
				majorTicks={['0', '90', '150']}
				minorTicks={9}

				//custom config:
				valueBox={false}

				colorPlate='#000000'
				colorPlateEnd='#121212'

				colorTitle='#ffffff'
				colorUnits='#ffffff'

				colorMinorTicks='#ffffff'
				colorMajorTicks='#ffffff'

				colorNumbers='#ffffff'

				colorNeedle='#1a80d2'
				colorNeedleEnd='#3f6baa'
				colorNeedleShadowUp='#d73230'
				colorNeedleShadowDown='#131c2e'

				needleType='line'
				needleStart={0}
				colorNeedleCircleInner='#282c35'
				colorNeedleCircleInnerEnd='#282c35'
				colorNeedleCircleOuter='#363a43'
				colorNeedleCircleOuterEnd='#282c35'
				needleCircleSize={13}

				borderInnerWidth={0}
				bordeeMiddleWidth={2}
				bordeeOuterWidth={7}

				colorBorderOuter='#777777'
				colorBorderMiddle='#777777'
				colorBorderInner='#777777'

				colorBorderOuterEnd='#777777'
				colorBorderMiddleEnd='#777777'
				colorBorderInnerEnd='#777777'

				highlights={[{
					"from": 120,
					"to": 150,
					"color": '#4a5e7a'
				}]}
			></RadialGauge>
		</div>;
	}

}

export default Dashboard;
