import { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';

import { APP } from '../../../../store/Store';

import DataChart from '../../../components/DataChart'
import DataList from '../../../components/DataList'


const Container = styled.div`
  display: flex;
  flex-direction:column;
  gap: 30px;
  width: 100%;
  height: 100%;
`;

const List = styled.div`
  display: flex;
  gap: 20px;
`;

const Charts = () => {
    const theme = useTheme()
    const app = APP((state) => state);

    const setCount = app.settings.constants.chart_input_current;
    const Datalist = DataList(app.settings.dash_charts, setCount, 2 ) // Amount of Items, 2 Columns



    return (
        <Container>
            <DataChart
                length={app.settings.dash_charts.length.value}
                resolution={app.settings.dash_charts.resolution.value}
                interpolation={app.settings.dash_charts.interpolation.value}
                setCount={setCount}
                tickCountX={5}  // Update with the desired number of X-axis ticks
                tickCountY={4}  // Update with the desired number of Y-axis ticks
                color_xGrid={theme.colors.dark}
                color_yGrid={theme.colors.dark}
            />
            <List>
                {Datalist}
            </List>
        </Container>

    )
};

export default Charts;
