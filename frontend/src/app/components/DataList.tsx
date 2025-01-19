import styled, { useTheme } from 'styled-components';
import { DATA, APP } from '../../store/Store';
import { Typography } from '../../theme/styles/Typography';


const Container = styled.div`
  display: flex;

  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;

  background-image: url('/assets/svg/background/glow.svg#glow'); /* Corrected */
  background-size: cover;  /* Adjust as needed */
  background-repeat: no-repeat; /* Prevents repeating */
  background-position: center; /* Centers the background */
`;

const List = styled.div`
  display: flex;

  height: 100%;
  width: 100%;

  box-sizing; border-box;
  padding-left: 20px;
  padding-right: 20px;
  gap: 20px;

  margin-bottom: 7px;
`

const Svg = styled.svg`
  width: 200px;
  height: 60px;
  border-radius: 12px;  /* Rounded edges for the button */
`;

const Divider = styled.div`
  flex: 1 1 0px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark};
  margin: 5px;
  align-self: flex-end;
`

const Element = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;

  height: 35px;
  width: 100%;

  margin-bottom: 7px;
`

const DataList = (dashPage, itemCount, columns) => {
    const theme = useTheme();

    const data = DATA((state) => state.data)
    const modules = APP((state) => state.modules);

    const Caption2 = Typography.Caption2

    const rows = [];
    const rowsPerColumn = Math.ceil(itemCount / columns); // Calculate the rows per column based on the number of elements

    // We will use two columns for rendering
    const lists = [[], []]; // lists[0] for the first column, lists[1] for the second column

    // Distribute the boxes into two lists
    for (let i = 0; i < itemCount; i++) {
        const columnIndex = i % columns; // Alternates between column 0 and column 1
        lists[columnIndex].push(i);
    }

    // Now render each column
    for (let colIndex = 0; colIndex < columns; colIndex++) {
        const columnBoxes = lists[colIndex];
        const columnRows = [];

        // Render rows for the current column
        for (let i = 0; i < rowsPerColumn; i++) {
            const boxIndex = columnBoxes[i];

            //Check if there is only value
            if (!isNaN(boxIndex)) { 

                const dataName = dashPage[`value_${boxIndex + 1}`].value
                const dataType = dashPage[`value_${boxIndex + 1}`].type
                const dataLabel = modules[dataType]((state) => state.settings.sensors[dataName].label)
                const dataUnit = modules[dataType]((state) => state.settings.sensors[dataName].unit)
                const dataValue = data[dataName]


                if (boxIndex !== undefined) {
                    const valueBox = (
                        <Svg key={`value_${boxIndex + 1}`} viewBox={`0 0 ${theme.interaction.buttonWidth} 30px`}>
                            <defs>
                                <linearGradient id="fadeBorder" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor={theme.colors.medium} />
                                    <stop offset="80%" stopColor="rgba(255, 255, 255, 0)" />
                                </linearGradient>
                            </defs>

                            <rect
                                x="0" y="0"
                                width={theme.interaction.buttonWidth}
                                height={theme.interaction.buttonHeight}
                                rx="12" ry="12"
                                fill="rgba(0, 0, 0, 0.2)"
                                stroke="url(#fadeBorder)"
                                strokeWidth="1"
                            />
                            <text
                                x="50%" y="28%"
                                textAnchor="middle" alignmentBaseline="central"
                                fontSize="16" fill={theme.colors.light}
                                fontFamily="Arial, sans-serif"
                            >
                                {dataValue}
                                {dataUnit}

                            </text>
                        </Svg>
                    );

                    const label = (
                        <span style={{ fontSize: '14px', color: theme.colors.light }}>
                            {dataLabel}
                        </span>
                    );

                    const divider = <Divider />;

                    // For the left column (colIndex === 0): label -> divider -> valueBox
                    // For the right column (colIndex === 1): valueBox -> divider -> label
                    if (colIndex === 0) {
                        columnRows.push(
                            <Element key={`row_${boxIndex}`} style={{ flexDirection: 'row' }}>
                                <Caption2>
                                    {label}
                                </Caption2>
                                {divider}
                                {valueBox}
                            </Element>
                        );
                    } else {
                        columnRows.push(
                            <Element key={`row_${boxIndex}`} style={{ flexDirection: 'row' }}>
                                {valueBox}
                                {divider}
                                <Caption2>
                                    {label}
                                </Caption2>
                            </Element>
                        );
                    }
                }
            }
        }

        // Add the column rows to the overall rows
        rows.push(
            <div key={`column_${colIndex}`} style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {columnRows}
            </div>
        );
    }

    // Return the layout with specified lists
    return (
        <Container>
            <List>
                {rows}
            </List>
        </Container>
    );
};

export default DataList;