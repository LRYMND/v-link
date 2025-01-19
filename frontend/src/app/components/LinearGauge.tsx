import styled, { useTheme } from 'styled-components';
import { useState, useEffect, useRef } from 'react';

import { DATA, APP } from '../../store/Store';
import { Display3, Typography } from '../../theme/styles/Typography';


// Styled container for the gauge
const Container = styled.div`
    position: relative;
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    background: none;
    border-radius: 7px;
    overflow: hidden;
    align-self: flex-start;
`;

const Speed = styled.div`
    background: none;
    position: absolute;

    top: 50%;
    left: 50%;
    transform: translate(-50%, 0);

    gap: 5px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

const RPM = styled.div`
    background: none;
    position: absolute;

    bottom: 0px;
    right: 20px;

    gap: 5px;

    display: flex;
    align-items: flex-end
`;

const Custom = styled.div`
    background: none;
    position: absolute;

    height: 40px;

    top: 20px;
    left: 20px;

    gap: 5px;

    display: flex;
    align-items: center;
`;

// Helper function to format numbers to single decimal magnitude
const formatToSingleDecimal = (number) => {
    if (number === 0) return "0";
    const magnitude = Math.floor(Math.log10(Math.abs(number)));
    const divisor = Math.pow(10, magnitude);
    return Math.floor(number / divisor);
};

const LinearGauge = () => {
    const theme = useTheme();
    const containerRef = useRef(null);

    const modules = APP((state) => state.modules);
    const settings = APP((state) => state.settings.dash_race);
    const data = DATA((state) => state.data);

    // Load data
    const progressName = settings.gauge_1.value
    const progressType = settings.gauge_1.type
    const progressValue = data[progressName];
    const progressUnit = modules[progressType]((state) => state.settings.sensors[progressName].unit)


    const topLeftName = settings.gauge_2.value
    const topLeftType = settings.gauge_2.type
    const topLeftValue = data[topLeftName];
    const topLeftUnit = modules[topLeftType]((state) => state.settings.sensors[topLeftName].unit)

    const centerName = settings.gauge_3.value
    const centerType = settings.gauge_3.type
    const centerValue = data[centerName];
    const centerUnit = modules[centerType]((state) => state.settings.sensors[centerName].unit)


    // Import Typography styles
    const Display4 = Typography.Display4
    const Display3 = Typography.Display3
    const Display1 = Typography.Display1
    const Body1 = Typography.Body1

    // Dimensions of the container
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const { width, height } = dimensions;

    // State variables for SVG content and rendering
    const [svg, setSVG] = useState(null);
    const [viewBox, setViewBox] = useState({ minX: 0, minY: 0, width: 0, height: 0 });
    const [bar, setBar] = useState(null);
    const [spline, setSpline] = useState(null);
    const [scale, setScale] = useState({ x: 1, y: 1 });
    const [ready, setReady] = useState(false);

    // Configuration constants
    const padding = 20;

    const maxValue = modules[progressType]((state) => state.settings.sensors[progressName].max_value)
    const limitStart = modules[progressType]((state) => state.settings.sensors[progressName].limit_start)
    const minValue = modules[progressType]((state) => state.settings.sensors[progressName].min_value)

    const reverseMarkers = true; // Toggle this to reverse markers

    /* Update scale factors whenever the dimensions or viewBox changes. */
    useEffect(() => {
        if (viewBox.width && viewBox.height && width && height) {
            setScale({
                x: (width - padding * 2) / viewBox.width,
                y: (height - padding * 2) / viewBox.height,
            });
        }
    }, [width, height, viewBox]);

    /* Observe container resizing and update dimensions. */
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
        };

        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    /* Fetch and parse the SVG content. */
    useEffect(() => {
        const loadSVG = async () => {
            try {
                const response = await fetch('/assets/svg/gauges/race.svg');
                const svgText = await response.text();
                const svgDoc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
                setSVG(svgDoc);
            } catch (error) {
                console.error('Error fetching or parsing SVG:', error);
            }
        };

        loadSVG();
    }, []);

    /* Extract paths and viewBox details from the SVG. */
    useEffect(() => {
        if (svg) {
            const svgElement = svg.querySelector('svg');
            const [minX, minY, width, height] = svgElement.getAttribute('viewBox').split(' ').map(Number);
            setViewBox({ minX, minY, width, height });

            setSpline(svg.getElementById('spline'));
            setBar(svg.getElementById('bar'));
            setReady(true);
        }
    }, [svg]);

    /* Calculate the number of intervals for markers. */
    const calculateIntervals = (markerEnd) => {
        const numIntervals = (formatToSingleDecimal(markerEnd) - formatToSingleDecimal(minValue) + 1);
        return numIntervals > 0 ? numIntervals : 1;
    };

    /* Calculate positions of markers along the spline. */
    const calculateMarkerPositions = (markerEnd) => {
        const numIntervals = calculateIntervals(markerEnd);
        const positions = [];

        if (spline) {
            const pathLength = spline.getTotalLength();
            const limitLength = pathLength * (markerEnd / maxValue);
            const intervalLength = limitLength / (numIntervals - 1);

            for (let i = 0; i < numIntervals; i++) {
                const lengthAtInterval = intervalLength * i;
                const point = spline.getPointAtLength(lengthAtInterval);

                const adjustedPoint = reverseMarkers
                    ? spline.getPointAtLength(pathLength - lengthAtInterval)
                    : point;

                positions.push(adjustedPoint);
            }
        }

        return positions;
    };

    /* Render a gradient for either the spline or bar. */
    const gradientDefault = (id, adjustedX) => (
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
                offset="0%"
                stopColor={theme.colors.theme.blue.default}
                stopOpacity="1"
            />
            <stop
                offset={`${((adjustedX - 1) / (width - padding * 2)) * 100}%`}
                stopColor={theme.colors.theme.blue.default}
                stopOpacity="1"
            />
            <stop
                offset={`${(adjustedX / (width - padding * 2)) * 100}%`}
                stopColor={theme.colors.light}
                stopOpacity="0"
            />
        </linearGradient>
    );

    /* Render a gradient for either the spline or bar. */
    const gradientLight = (id, adjustedX) => (
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
                offset="0%"
                stopColor={theme.colors.theme.blue.active}
                stopOpacity="1"
            />
            <stop
                offset={`${((adjustedX - 1) / (width - padding * 2)) * 100}%`}
                stopColor={theme.colors.theme.blue.active}
                stopOpacity="1"
            />
            <stop
                offset={`${(adjustedX / (width - padding * 2)) * 100}%`}
                stopColor={theme.colors.light}
                stopOpacity="0"
            />
        </linearGradient>
    );

    /* Render a gradient for either the spline or bar. */
    const gradientValue = (id, adjustedX) => (
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
                offset="0%"
                stopColor={theme.colors.theme.blue.default}
                stopOpacity="1"
            />
            <stop
                offset={`${((adjustedX - 30) / (width - padding * 2)) * 100}%`}
                stopColor={theme.colors.theme.blue.active}
                stopOpacity="1"
            />
            <stop
                offset={`${((adjustedX - 15) / (width - padding * 2)) * 100}%`}
                stopColor={theme.colors.theme.blue.active}
                stopOpacity="1"
            />
            <stop
                offset={`${((adjustedX - 1) / (width - padding * 2)) * 100}%`}
                stopColor={theme.colors.light}
                stopOpacity="1"
            />
            <stop
                offset={`${(adjustedX / (width - padding * 2)) * 100}%`}
                stopColor={theme.colors.light}
                stopOpacity="0"
            />

        </linearGradient>
    );

    const gradientLimit = (id, value1, value2, color) => (
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
                offset={`${((value1 - 1) / (width - padding * 2)) * 100}%`}
                stopColor={color}
                stopOpacity="0"
            />
            <stop
                offset={`${((value1) / (width - padding * 2)) * 100}%`}
                stopColor={color}
                stopOpacity="1"
            />

            <stop
                offset={`${((value2) / (width - padding * 2)) * 100}%`}
                stopColor={color}
                stopOpacity="1"
            />
            <stop
                offset={`${((value2 + 1) / (width - padding * 2)) * 100}%`}
                stopColor={color}
                stopOpacity="0"
            />



        </linearGradient>
    );

    /* Render the spline with its gradient. */
    const renderSpline = () => {
        if (spline) {
            const splinePath = spline.getAttribute('d');
            const markerPositions = calculateMarkerPositions(maxValue);
            const lastMarkerPosition = markerPositions[markerPositions.length - 1];

            const adjustedX = lastMarkerPosition.x;

            return (
                <>
                    <defs>
                        {gradientLight('splineGradient', adjustedX)}
                    </defs>
                    <path
                        d={splinePath}
                        fill="none"
                        stroke="url(#splineGradient)"
                        strokeWidth="6"
                        transform={`translate(${padding}, ${padding}) scale(${scale.x}, ${scale.y})`}
                    />
                </>
            );
        }
    };

    /* Render the bar with its gradient. */
    const renderBar = () => {
        if (bar) {
            const barPath = bar.getAttribute('d');
            const markerPositions = calculateMarkerPositions(limitStart);
            const lastMarkerPosition = markerPositions[markerPositions.length - 1];

            const adjustedX = lastMarkerPosition.x;

            return (
                <>
                    <defs>
                        {gradientDefault('barGradient', adjustedX)}
                    </defs>
                    <path
                        d={barPath}
                        fill="url(#barGradient)"
                        stroke="none"
                        transform={`translate(${padding}, ${padding}) scale(${scale.x}, ${scale.y})`}
                    />
                </>
            );
        }
    };

    /* Render the labels for the Marker */
    const renderMarkers = () => {
        const markerPositions = calculateMarkerPositions(limitStart);

        return markerPositions.map((point, index) => {
            // Remove one marker by skipping the last one
            if (index === markerPositions.length - 1) {
                return null; // Skip the last marker
            }

            const startX = padding + point.x * scale.x;
            const startY = padding + point.y * scale.y;
            const endY = 12 + padding + point.y * scale.y;

            return (
                <line
                    key={index}
                    x1={startX + 3}
                    y1={startY - 2}
                    x2={startX + 3}
                    y2={endY}
                    stroke={theme.colors.theme.blue.active}
                    strokeWidth="8"
                />
            );
        }).filter(Boolean); // filter out null values to avoid rendering unwanted markers
    };

    /* Render the vertical Markers */
    const renderLabels = () => {
        const markerPositions = calculateMarkerPositions(maxValue);

        // Exclude the first marker
        return markerPositions.slice(1).map((point, index) => {
            const labelX = padding + point.x * scale.x;
            const labelY = padding + point.y * scale.y;

            const Body1 = Typography.Body1;

            return (
                <text
                    x={labelX + 3} // Adjust position slightly for padding
                    y={labelY + 30} // Position text slightly above the marker
                    fontSize="12"
                    fontFamily="Arial, sans-serif"
                    fill="#DBDBDB" // Text color
                    textAnchor="middle" // Center-align the text
                >
                    {index + 1}
                </text>
            );
        }).filter(Boolean); // filter out null values to avoid rendering unwanted markers
    };

    /* Renders scaling label */
    const renderScale = () => {
        const markerPositions = calculateMarkerPositions(maxValue);

        // Ensure there are at least two markers to work with
        //if (markerPositions.length < 2) return null;

        // Get the 2nd marker's position
        const secondMarker = markerPositions[1];
        const labelX = padding + secondMarker.x * scale.x;
        const labelY = padding + secondMarker.y * scale.y;

        const Body1 = Typography.Body1;

        return (
            <text
                x={labelX + 3} // Adjust position slightly for padding
                y={labelY + 50} // Position text below the second marker
                fontSize="14"
                fontFamily="Arial, sans-serif"
                fontWeight="700"
                fill="#DBDBDB" // Text color
                textAnchor="middle" // Center-align the text
            >
                1/MIN x 1000
            </text>
        );
    };


    /* Render the spline with its gradient. */
    /* Render the limit with its gradient for the spline. */
    const renderRedline = () => {
        if (spline) {
            const splinePath = spline.getAttribute('d');

            // Calculate marker positions along the spline
            const markerPositions = calculateMarkerPositions(limitStart);

            // Get the last marker position, as this is where the gradient should start
            const lastMarkerPosition = markerPositions[markerPositions.length - 1];

            // Calculate the total length of the spline
            const pathLength = spline.getTotalLength();

            // Now calculate the adjusted position based on the reverseMarkers flag
            let adjustedX = lastMarkerPosition.x;


            // Render the path with the gradient applied
            return (
                <>
                    <defs>
                        {gradientLimit('limitRedline', adjustedX, 1000, theme.colors.theme.blue.highlightDark)}
                    </defs>
                    <path
                        d={splinePath}
                        fill="none"
                        stroke="url(#limitRedline)"
                        strokeWidth="6"
                        transform={`translate(${padding}, ${padding + 10}) scale(${scale.x}, ${scale.y})`}
                    />
                </>
            );
        }
    };

    /* Render the limit with its gradient and glow effect. */
    const renderLimit = () => {
        if (bar) {
            const barPath = bar.getAttribute('d');
            const normalized1 = (progressValue / maxValue); // Normalize the value to a range [0, 1]
            const totalWidth = width - padding * 2; // Subtract padding from total width to get usable space
            const xEnd = normalized1 * totalWidth; // Multiply by width

            const normalized2 = limitStart / maxValue;
            const xStart = normalized2 * totalWidth;

            return (
                <>
                    <defs>
                        {gradientLimit('limitGradient', xStart, xEnd, '#FF0000')}
                        <filter id="glowEffectLimit" x="-50%" y="-50%" width="200%" height="200%">
                            {/* Add a blur effect */}
                            <feGaussianBlur stdDeviation="60" result="blurredGlow" />
                            {/* Merge the original and the blurred path */}
                            <feMerge>
                                <feMergeNode in="blurredGlow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <path
                        d={barPath}
                        fill="url(#limitGradient)"
                        stroke="none"
                        transform={`translate(${padding}, ${padding}) scale(${scale.x}, ${scale.y})`}
                        filter="url(#glowEffectLimit)" // Apply the glow effect
                    />
                </>
            );
        }
    };

    /* Render the bar with its gradient and glow effect */
    const renderValue = () => {
        if (spline) {
            const barPath = bar.getAttribute('d');
            let value = 0;
            if (progressValue < limitStart)
                value = progressValue;
            else
                value = progressValue;
            const normalizedValue = (value / maxValue); // Normalize the value to a range [0, 1]
            const totalWidth = width - padding * 2; // Subtract padding from total width to get usable space
            const xPosition = normalizedValue * totalWidth; // Multiply by width

            return (
                <>
                    <defs>
                        {gradientValue('valueGradient', xPosition)}
                        <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
                            {/* Add a blur effect */}
                            <feGaussianBlur stdDeviation="60" result="coloredBlur" />
                            {/* Merge the original and the blurred path */}
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <path
                        d={barPath}
                        fill="url(#valueGradient)"
                        stroke="none"
                        transform={`translate(${padding}, ${padding}) scale(${scale.x}, ${scale.y})`}
                        filter="url(#glowEffect)" // Apply the glow effect
                    />
                </>
            );
        }
    };

    return (
        <Container ref={containerRef}>
            {ready && (
                <>
                    <svg width={width} height={height}>
                        {renderSpline()}
                        {renderBar()}

                        {renderMarkers()}
                        {renderLabels()}
                        {renderScale()}

                        {progressValue > limitStart ? renderLimit() : <></>}
                        {renderRedline()}

                        {renderValue()}
                    </svg>

                    <Speed>
                        <Display3> {centerValue} </Display3>
                        <Display1
                            style={{
                                transform: 'translate(0px, 5px)',
                            }}>
                            {centerUnit}
                        </Display1>
                    </Speed>

                    <RPM
                        style={{
                            textShadow: '0px 0px 70px rgba(255, 255, 255, 0.3)' // Glow effect
                        }}>
                        <Display4> {progressValue} </Display4>
                        <Body1>{progressUnit} </Body1>
                    </RPM>

                    <Custom>
                        <Display3> {topLeftValue} </Display3>
                        <Body1> {topLeftUnit} </Body1>
                    </Custom>
                </>
            )}
        </Container>
    );
};

export default LinearGauge;
