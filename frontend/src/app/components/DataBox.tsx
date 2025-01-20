import { useState, useEffect, useRef } from 'react';
import styled, { useTheme } from 'styled-components';

import { DATA, APP } from '../../store/Store';
import { Typography } from '../../theme/styles/Typography';
import { IconLarge, CustomIcon } from '../../theme/styles/Icons';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  box-sizing: border-box;
  padding-top: 30px;

  background-image: url('/assets/svg/background/road.svg#road');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const Databox = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;
const Icons = styled.div`
  flex 1;

  display: flex;
  gap: calc(30% - 15px);   // FIX THIS!!!!!!!!!!!!!!

  justify-content: center;
  align-items: center;
  width: 100%;
  height: 20px;

  padding-left: 20px;
  padding-right: 20px;
  box-sizing: border-box;
  `;

const Svg = styled.svg`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const DataBox = (dashPage) => {
    const theme = useTheme();

    const app = APP((state) => state)
    const data = DATA((state) => state.data);
    const modules = APP((state) => state.modules);
    const settings = APP((state) => state.settings.dash_classic);

    const padding = 20; // Padding for the rect size
    const containerRef = useRef(null);

    const [scale, setScale] = useState({ x: 1, y: 1 });
    const [viewBox, setViewBox] = useState({ minX: 0, minY: 0, width: 0, height: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const { width, height } = dimensions;


    /* Update scale factors whenever the dimensions or viewBox changes. */
    useEffect(() => {
        if (viewBox.width && viewBox.height && width && height) {
            console.log("useEffect1: ", width, height)
            setScale({
                x: (width - padding * 2) / viewBox.width,
                y: (height - padding * 2) / viewBox.height,
            });
        }
    }, [width, height, viewBox]);

    /* Observe container resizing and update dimensions. */
    useEffect(() => {
        const handleResize = () => {
            console.log("useEffect2: ", containerRef.current.offsetWidth, containerRef.current.offsetHeight)
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
        };

        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    const leftName = settings.value_1.value
    const leftType = settings.value_1.type
    const leftID = modules[leftType]((state) => state.settings.sensors[leftName].app_id)

    const rightName = settings.value_2.value
    const rightType = settings.value_2.type
    const rightID = modules[rightType]((state) => state.settings.sensors[rightName].app_id)



    //const maxValue = modules[progressType]((state) => state.settings.sensors[progressName].max_value)
    //const limitStart = modules[progressType]((state) => state.settings.sensors[progressName].limit_start)
    //const minValue = modules[progressType]((state) => state.settings.sensors[progressName].min_value)



    // Return the layout
    return (
        <Container>
            <Icons>
                <CustomIcon color={theme.colors.light} stroke={2} size={'25px'}>
                    <use xlinkHref={`/assets/svg/icons/bold/${leftID}_bold.svg#${leftID}`}></use>
                </CustomIcon>
                <CustomIcon color={theme.colors.medium} stroke={2} size={'40px'}>
                    <use xlinkHref={`/assets/svg/icons/bold/${'err_bold'}.svg#${'err'}`}></use>
                </CustomIcon>
                <CustomIcon color={theme.colors.light} stroke={2} size={'25px'}>
                    <use xlinkHref={`/assets/svg/icons/bold/${rightID}_bold.svg#${rightID}`}></use>
                </CustomIcon>
            </Icons>
            <Databox ref={containerRef}>
                {width > 0 && height > 0 && (
                    <Svg viewBox={`0 0 ${width} ${height}`}>
                        <defs>
                            <linearGradient id="fadeDatabox" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={theme.colors.medium} />
                                <stop offset="80%" stopColor="rgba(255, 255, 255, 0)" />
                            </linearGradient>
                        </defs>
                        <rect
                            x={padding} // Center the box by applying half the padding as an offset
                            y={padding}
                            width={width - (padding * 2)} // Subtract padding from width
                            height={height - (padding * 2)} // Subtract padding from height
                            rx="12" // Rounded corners
                            ry="12"
                            fill="rgba(0, 0, 0, 0.2)"
                            stroke="url(#fadeDatabox)"
                            strokeWidth="1"
                        />

                        {/* Calculate the total width and gap */}
                        <text
                            x={width / 2 - 1.5 * 155} // Shift the first text left for the total group to be centered
                            y={height / 2} // Center text vertically
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fontSize="16"
                            fill={theme.colors.light}
                            fontFamily="Arial, sans-serif"
                        >
                            {data[leftName]}
                        </text>

                        <text
                            x={width / 2} // Center the second text horizontally
                            y={height / 2} // Center text vertically
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fontSize="16"
                            fill={theme.colors.medium}
                            fontFamily="Arial, sans-serif"
                        >
                            No Messages
                        </text>

                        <text
                            x={width / 2 + 1.5 * 155} // Shift the third text right for the total group to be centered
                            y={height / 2} // Center text vertically
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fontSize="16"
                            fill={theme.colors.light}
                            fontFamily="Arial, sans-serif"
                        >
                            {data[rightName]}
                        </text>

                    </Svg>
                )}
            </Databox>

        </Container>
    );
};

export default DataBox;
