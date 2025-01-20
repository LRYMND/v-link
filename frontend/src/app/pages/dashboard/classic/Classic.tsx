import { useState, useEffect, useMemo } from 'react'
import styled, { useTheme } from 'styled-components';

import { APP } from '../../../../store/Store';

import RadialGauge from '../../../components/RadialGauge'
import DataBox from '../../../components/DataBox'


const Container = styled.div`
  display: flex; 
  flex-direction:column;
  width: 100%;
  height: 100%;
`;

const Classic = () => {
	const app = APP((state) => state);

	const theme = useTheme()

	const gaugeSize = 0.75 // 0.1 - 1.0 -> Percentage of parent div height
	const gauges = 3
	const [size, setSize] = useState(0);

	useEffect(() => {
		const width = (app.system.contentSize.width - (app.settings.general.contentPadding.value * 2)) / gauges
		const height = (app.system.contentSize.height - (app.settings.general.contentPadding.value * 2)) * gaugeSize

		if (width <= height) {
			setSize(width)
		} else if (width >= height) {
			setSize(height)
		}
	}, [app.system.contentSize, app.settings.general.contentPadding.value])


	const Databox = DataBox(app.settings.dash_race) // Amount of Items, 2 Columns

	return (
		<Container>
			<div
				style={{
					flex: 1,

					display: 'flex',
					justifyContent: 'center',
					alignItems: 'flex-end',

					height: '100%',
					width: '100%',

					backgroundImage: 'url(/assets/svg/background/horizon.svg#horizon)', /* Corrected */
					backgroundSize: 'cover',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center',
				}}>
				<div style={{ height: '60%' }}>
					<RadialGauge
						sensor={app.settings.dash_classic.gauge_2.value}
						type={app.settings.dash_classic.gauge_2.type}
					/>
				</div>
				<RadialGauge
					sensor={app.settings.dash_classic.gauge_1.value}
					type={app.settings.dash_classic.gauge_1.type}
				/>
				<RadialGauge
					sensor={app.settings.dash_classic.gauge_2.value}
					type={app.settings.dash_classic.gauge_2.type}
				/>
				<div style={{ height: '60%' }}>
					<RadialGauge
						sensor={app.settings.dash_classic.gauge_2.value}
						type={app.settings.dash_classic.gauge_2.type}
					/>
				</div>
			</div>
			<div
				style={{
					//flex: 0,
					width: '100%',
					height: '35%',

					backgroundImage: 'url(/assets/svg/background/glow.svg#glow)', /* Corrected */
					backgroundSize: 'contain',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center',
				}}>
				{Databox}
			</div>

		</Container>
	)
};


export default Classic;