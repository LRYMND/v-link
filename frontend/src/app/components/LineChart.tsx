import { useState, useEffect, useRef } from 'react';
import { DATA, APP } from '../../store/Store';
import convert from 'color-convert';
import "./../../themes.scss";
import "./../../styles.scss";
import App from '../../App';

// Bézier Curve Function
const bzCurve = (ctx, points, f = 0.3, t = 0.6) => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    let dx1 = 0, dy1 = 0, m, dx2, dy2;
    let preP = points[0];

    for (let i = 1; i < points.length; i++) {
        const curP = points[i];
        const nexP = points[i + 1];

        if (nexP) {
            m = (nexP.y - preP.y) / (nexP.x - preP.x);  // gradient
            dx2 = (nexP.x - curP.x) * -f;
            dy2 = dx2 * m * t;
        } else {
            dx2 = 0;
            dy2 = 0;
        }

        ctx.bezierCurveTo(
            preP.x - dx1, preP.y - dy1,
            curP.x + dx2, curP.y + dy2,
            curP.x, curP.y
        );

        dx1 = dx2;
        dy1 = dy2;
        preP = curP;
    }

    ctx.stroke();
};

// Main LineChart Component
const LineChart = ({
    setCount,
    width,
    height,
    padding,
    tickCountX,
    tickCountY,
    length,
    interval,
    color_xGrid,
    color_yGrid,
    color_axis,
    color_dash_charts,
    backgroundColor
}) => {
    // Load Settings
    const modules = APP((state) => state.modules);
    const settings = APP((state) => state.settings);
    const data = DATA((state) => state.data);

    const datasets = [];
    for (let i = 1; i <= setCount; i++) {
        const key = "value_" + i;
        const sensor = settings.dash_charts[key].value;
        const value = data[sensor];
        const type = settings.dash_charts[key].type;
        const config = modules[type]((state) => state.settings.sensors[sensor]);

        datasets[i - 1] = {
            label: config.label,
            color: 'var(--themeDefault)',
            yMin: config.min_value,
            yMax: config.max_value,
            data: value,
            interval: 100,
        };
    }

    const [ready, setReady] = useState(false);
    const [dataStreams, setDataStreams] = useState(datasets.map(dataset => Array(length).fill(dataset.yMin)));
    const [colorVariations, setColorVariations] = useState([]);
    const canvasRef = useRef(null);

    // Track last received data point for each dataset separately
    const lastDataPoints = useRef(datasets.map(() => datasets[0].yMin));

    useEffect(() => {
        if (colorVariations) setReady(true);
    }, [colorVariations]);

    useEffect(() => {
        const chartColors = generateColorVariations();
        setColorVariations(chartColors);
    }, []);

    const generateColorVariations = () => {
        const hueStep = 25;
        const saturationStep = -10;
        const brightnessStep = 5;
        const baseColor = color_dash_charts.replace(/#/g, '');
        const hsbColor = convert.hex.hsv(baseColor);
        return Array.from({ length: dataStreams.length }, (_, i) => {
            const modifiedHsbColor = [
                (hsbColor[0] + i * hueStep) % 360,
                Math.max(0, Math.min(100, hsbColor[1] + i * saturationStep)),
                Math.max(0, Math.min(100, hsbColor[2] + i * brightnessStep)),
            ];
            return '#' + convert.hsv.hex(modifiedHsbColor);
        });
    };

    const xScale = width / (length - 1);

    const renderGrid = (ctx) => {
        // Calculate the shared Y-axis range across all datasets
        const globalYMin = Math.min(...datasets.map(dataset => dataset.yMin));
        const globalYMax = Math.max(...datasets.map(dataset => dataset.yMax));

        // Create X-Grid
        const xTickDistance = (length - 1) / tickCountX;
        for (let i = 1; i < tickCountX; i++) {  // Start at 1 to skip the leftmost line
            const xPos = i * xTickDistance * xScale;
            ctx.beginPath();
            ctx.moveTo(xPos, 0);
            ctx.lineTo(xPos, height);
            ctx.strokeStyle = color_xGrid;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Create a unified Y-Grid
        const yTickDistance = (globalYMax - globalYMin) / tickCountY;
        for (let i = 1; i < tickCountY; i++) {  // Start at 1 to skip the topmost line
            const yPos = height - ((i * yTickDistance) / (globalYMax - globalYMin)) * height;
            ctx.beginPath();
            ctx.moveTo(0, yPos);
            ctx.lineTo(width, yPos);
            ctx.strokeStyle = color_yGrid; // Ensure this matches the desired grid color
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    };


    const renderLineCharts = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, width, height); // Clear the canvas before drawing new data

        // Render Grid
        renderGrid(ctx);

        datasets.forEach((dataset, datasetIndex) => {
            const newData = Math.abs(dataset.data);

            // Initialize the data array for the dataset if it doesn't exist
            if (!dataStreams[datasetIndex]) {
                dataStreams[datasetIndex] = [];
            }

            // If the new data is different from the last valid data, push the new data
            // If it's the same, push null (to skip drawing this duplicate value)
            if (newData !== lastDataPoints.current[datasetIndex]) {
                dataStreams[datasetIndex].push(newData); // Add new data point
            } else {
                dataStreams[datasetIndex].push(null); // Add null for duplicate value
            }

            lastDataPoints.current[datasetIndex] = newData; // Update the last valid data for comparison

            // Create valid data points for drawing, skipping null values
            const validDataPoints = dataStreams[datasetIndex]
                .map((value, index) => {
                    //console.log(dataStreams[datasetIndex])
                    // If the first element is null, replace it with the last valid value
                    if (index === 0 && value === null) {
                        return {
                            x: xScale, // Extend slightly outside the left edge
                            y: height - ((lastDataPoints.current[datasetIndex] - dataset.yMin) / (dataset.yMax - dataset.yMin)) * height
                        };
                    }

                    // If the value is null, skip it
                    if (value === null) return null;

                    // If not null, map it to valid points
                    return {
                        x: index * xScale,
                        y: height - ((value - dataset.yMin) / (dataset.yMax - dataset.yMin)) * height
                    };
                })
                .filter(point => point !== null); // Remove null points for rendering

            if (validDataPoints.length > 0) {
                const lastPoint = validDataPoints[validDataPoints.length - 1];
                validDataPoints.push({
                    x: width + xScale, // Extend slightly outside the right edge
                    y: lastPoint.y     // Keep the last y value constant
                });
            }

            // Only render the line if there are valid points
            if (validDataPoints.length > 1) {
                ctx.strokeStyle = colorVariations[datasetIndex];
                ctx.lineWidth = 2;

                // Call the bzCurve function to draw the Bézier curve using valid data points
                bzCurve(ctx, validDataPoints);
            }
        });
    };


    useEffect(() => {
        const timer = setInterval(() => {
            const newDataStreams = datasets.map((dataset, index) => {
                let value = Math.abs(dataset.data);
                if (isNaN(value)) value = 0;


                // Compare with the previous value
                if (value != Math.abs(parseFloat(lastDataPoints.current[index]))) {
                    //console.log(value, Math.abs(parseFloat(lastDataPoints.current[index])))
                    value = Math.max(dataset.yMin, Math.min(dataset.yMax, value));
                } else {
                    value = null
                }
                lastDataPoints.current[index] = value;  // Update the last value for this dataset
                return [value, ...dataStreams[index].slice(0, length - 1)];
            });

            setDataStreams(newDataStreams);  // Update the state with the new data
        }, interval);

        return () => clearInterval(timer);
    }, [datasets, dataStreams, interval]);

    useEffect(() => {
        if (ready) {
            renderLineCharts(); // Draw on the canvas after data is ready
        }
    }, [ready, dataStreams, colorVariations]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignSelf: "flex-start",
            backgroundColor,
            borderRadius: '20px',
            overflow: 'auto',
            boxShadow: '0px 5px 10px 0px black',
            position: 'relative', // Allow positioning text on top of the canvas
        }}>
            {ready && (
                <canvas ref={canvasRef} width={width} height={height} />
            )}

            <div style={{
                position: 'absolute',
                bottom: '10px',  // Keep it near the bottom
                right: '10px',   // Position it on the right side
                display: 'flex',
                flexDirection: 'column',  // Stack labels vertically
                alignItems: 'flex-end',    // Align labels to the right
                backgroundColor: 'transparent',  // No background for the container
                zIndex: 2, // Ensure the labels appear on top of the chart
            }}>
                {datasets.map((dataset, index) => (
                    <div key={index} style={{
                        backgroundColor: 'black', // Label's background color
                        color: colorVariations[index], // Text color matching dataset's color
                        padding: '2px 8px',
                        margin: '2px 0',  // Adjust spacing between labels
                        borderRadius: '5px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        {dataset.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LineChart;
