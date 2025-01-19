import { DATA, APP } from '../../store/Store';
import styled, { useTheme } from 'styled-components';

import { useState, useEffect, useRef } from 'react';


const cos = Math.cos;
const sin = Math.sin;
const π = Math.PI;

const f_matrix_times = (([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y]);
const f_rotate_matrix = (x => [[cos(x), -sin(x)], [sin(x), cos(x)]]);
const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);

// Helper function to format numbers to single decimal magnitude
const formatToSingleDecimal = (number) => {
    if (number === 0) return "0";
    const magnitude = Math.floor(Math.log10(Math.abs(number)));
    const divisor = Math.pow(10, magnitude);
    return Math.floor(number / divisor);
};

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
    justify-content: center;
    align-items: center;
`;

export const RadialGauge = ({
    sensor,
    type,
}) => {

    // Load Settings
    const modules = APP((state) => state.modules);
    const data = DATA((state) => state.data)
    const theme = useTheme()

    let value = data[sensor]

    // Load interface config based on type
    const store = modules[type];
    const settings = store ? store((state) => state.settings.sensors[sensor]) : {};
    const label = settings.label

    const maxValue = settings.max_value
    const minValue = settings.min_value
    const limitStart = settings.limit_start

    const borderColor = 'black'
    const backgroundColor = 'black'
    const progressBackgroundColor = 'grey'
    const textColor1 = 'grey'
    const textColor2 = 'white'


    /* Update scale factors whenever the dimensions or viewBox changes. */
    // State variables for SVG content and rendering


    // Dimensions of the container
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [mainRadius, setMainRadius] = useState(0);

    const padding = 30;
    const containerRef = useRef(null);

    /* Observe container resizing and update dimensions. */
    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
            setMainRadius((containerRef.current.offsetHeight - (padding * 2)) / 2)
        };

        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current) resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);



    // Center of Gauge
    const cx = dimensions.height / 2;
    const cy = dimensions.height / 2;

    // Main Arc
    const arcGap = 60;
    let mainArc = 360 - arcGap
    if (mainArc < 1)
        mainArc = 1


    // Circle declarations
    const outlineOffset = -7;
    const outlineRadius = mainRadius - outlineOffset




    if (isNaN(value))
        value = minValue;

    if (value > maxValue) {
        value = maxValue;
    }

    if (value < minValue) {
        value = minValue;
    }

    const angleToRadians = (angle) => angle * π / 180;

    /* Calculate arc lengths in percentage */
    const percentFillerEnd = (value / maxValue) * 100;
    const percentLimitStart = (limitStart / maxValue) * 100;

    /* Calculate arc offset */
    // This value represents the angular offset required to center the main arc
    // (and any associated arcs within the gauge).
    const arcOffset = (360 - mainArc) / 2;


    /* Calculate Radians */
    // Order of these variables is important
    let progressArc = angleToRadians(mainArc * (percentFillerEnd / 100));
    let limitArc = angleToRadians(mainArc * (percentLimitStart / 100));
    mainArc = angleToRadians(mainArc) % (2 * π);


    // Adjust Rotation
    const mainRotationAngle = 90
    const mainRotationRadian = angleToRadians(mainRotationAngle + arcOffset)

    const rotMatrix = f_rotate_matrix(mainRotationRadian);

    /* Calculate Arcs */
    const computeCoordinates = (angle, mainRadius) => {
        const vector = [mainRadius * cos(angle), mainRadius * sin(angle)];
        const rotatedVector = f_matrix_times(rotMatrix, vector);
        return f_vec_add(rotatedVector, [cx, cy]);
    };


    const computeFlags = (arc, threshold) => {
        const fA = ((arc > threshold) ? 1 : 0); //Larger Arc : Smaller Arc
        const fS = ((arc > 0) ? 1 : 0); //Clockwise : Counterclockwise
        return (`${fA} ${fS}`)
    };

    //   d={generateArc(progressArc, 0, outlineRadius, 0, limitArc, mainArc)}

    const generateArc = (arcAngle, arcOffset, arcRadius, radiusOffset, reference, threshold) => {
        const radius = arcRadius + radiusOffset

        const [sx, sy] = computeCoordinates(0 + arcOffset, radius);
        const [ex, ey] = computeCoordinates(0 + arcAngle, radius);

        /* Returns d-attribute with start point, size, arclength, orientation and end point */
        return (
            `M ${sx},${sy}
             A ${radius},${radius},${arcAngle / (2 * π) * 360},
             ${computeFlags(reference, threshold)}
             ${ex},${ey}`
        )
    }




    const markerCount = 75 // Total number of markers
    const markerStart = 10 // Distance from the center for marker start
    const markerEnd = 25   // Distance from the center for marker end
    const markerWidth = 3 // Width of the markers

    // Marker Generation
    const generateMarkers = () => {
        const markers = [];
        const angleStep = mainArc / markerCount; // Angle step for all markers along the main arc
        const maxMarkers = Math.floor((progressArc / mainArc) * markerCount); // Only draw markers up to progressArc

        for (let i = 0; i <= maxMarkers; i++) {
            const angle = i * angleStep;
            const start = computeCoordinates(angle, mainRadius - markerStart);
            const end = computeCoordinates(angle, mainRadius - markerEnd);

            markers.push(
                <line
                    key={i}
                    x1={start[0]}
                    y1={start[1]}
                    x2={end[0]}
                    y2={end[1]}
                    stroke={theme.colors.medium}
                    strokeWidth={markerWidth}
                />
            );
        }
        return markers;
    };


    const labelCount = formatToSingleDecimal(maxValue) + 1;  // Number of labels you want to display
    const labelOffset = -20;  // Distance from the center to place the labels

    const generateTextLabels = () => {
        const labels = [];
        const angleStep = mainArc / (labelCount - 1);  // Calculate angle for each label position

        for (let i = 0; i < labelCount; i++) {
            const angle = i * angleStep;
            const [x, y] = computeCoordinates(angle, mainRadius - labelOffset);
            const labelValue = minValue + (i / (labelCount - 1)) * (maxValue - minValue);  // Calculate label value

            labels.push(
                <text
                    key={i}
                    fill={theme.colors.light}
                    fontSize={(0.4 / 10) * dimensions.height}  // Adjust font size based on height
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"  // Vertically center the text
                >
                    {labelValue.toFixed(0)}  {/* Display value, adjusted to integer */}
                </text>
            );
        }

        return labels;
    };


    return (
        <Container ref={containerRef}>
            <svg
                height={dimensions.height}
                width={dimensions.height}
            >
                {/* Glow Effect Filter */}
                <defs>
                    <filter id="glowEffect" x="-100%" y="-100%" width="400%" height="400%">
                        {/* Add a blur effect */}
                        <feGaussianBlur stdDeviation="20" result="coloredBlur" />
                        {/* Merge the original and the blurred path */}
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <linearGradient id="progressGradient" gradientUnits="userSpaceOnUse">
                        <stop
                            offset="0%"
                            stopColor={theme.colors.theme.blue.default}
                            stopOpacity="1"
                        />
                        <stop
                            offset={`${((progressArc - 30) / mainArc) * 100}%`}
                            stopColor={theme.colors.theme.blue.active}
                            stopOpacity="1"
                        />
                        <stop
                            offset={`${((progressArc - 15) / mainArc) * 100}%`}
                            stopColor={theme.colors.theme.blue.active}
                            stopOpacity="1"
                        />
                        <stop
                            offset={`${((progressArc - 1) / mainArc) * 100}%`}
                            stopColor={theme.colors.light}
                            stopOpacity="1"
                        />
                        <stop
                            offset="100%"
                            stopColor={theme.colors.light}
                            stopOpacity="0"
                        />
                    </linearGradient>

                </defs>

                <circle
                    cx={cx}
                    cy={cy}
                    r={mainRadius}
                    fill='none'
                    stroke={borderColor}
                    strokeWidth={0}
                />

                <text
                    className="gauge_unitLabel"
                    fill={textColor1}
                    fontSize={(0.5 / 10) * dimensions.height}
                    x="50%"
                    y="55%"
                    dy="20px"
                    textAnchor="middle"
                >
                    {`${settings.unit}`}
                </text>

                <text
                    className="gauge_valueLabel"
                    fill={textColor2}
                    fontSize={(1.2 / 10) * dimensions.height}
                    x="50%"
                    y="45%"
                    dy="20px"
                    textAnchor="middle"
                    filter="url(#glowEffect)"
                >
                    {`${data[sensor]}`}
                </text>

                <path className="backgroundMain"
                    strokeWidth={5}
                    strokeLinecap="round"
                    fill='none'
                    stroke={progressBackgroundColor}
                    d={generateArc(mainArc, 0, mainRadius, 0, mainArc, π)}
                />


                <path className="progressMain"
                    strokeWidth={5}
                    strokeLinecap="round"
                    fill='none'
                    stroke="url(#progressGradient)"
                    d={generateArc(progressArc, 0, mainRadius, 0, progressArc, π)}
                />

                <path className="backgroundOutline"
                    strokeWidth={2}
                    strokeLinecap="round"
                    fill='none'
                    stroke={theme.colors.medium}
                    d={generateArc(mainArc, 0, outlineRadius, 0, mainArc, π)}
                />

                <path className="progressOutline"
                    strokeWidth={2}
                    strokeLinecap="round"
                    fill='none'
                    stroke={theme.colors.light}
                    d={generateArc(progressArc, 0, outlineRadius, 0, progressArc, π)}
                />

                <path className="backgroundLimit"
                    strokeWidth={2}
                    strokeLinecap="round"
                    fill='none'
                    stroke={theme.colors.theme.blue.highlightDark}
                    d={generateArc(mainArc, limitArc, outlineRadius, 0, limitArc, mainArc)}
                />

                {generateMarkers()}
                {generateTextLabels()}
            </svg>
        </Container>
    );

};

export default RadialGauge;