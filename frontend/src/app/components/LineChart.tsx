import { useState, useEffect } from 'react';
import { DATA, APP } from '../../store/Store';
import convert from 'color-convert';
import { saveAs } from 'file-saver'; // Import FileSaver.js for downloading the file
import "./../../themes.scss";
import "./../../styles.scss";

const LineChart = ({
    length = 2500,
    resolution = 100,
    interpolation = true,
    setCount,
    width,
    height,
    tickCountX,
    tickCountY,
    color_xGrid,
    color_yGrid,
    color_dash_charts,
    backgroundColor
}) => {
    const steps = parseInt(length / resolution);
    const modules = APP((state) => state.modules);
    const settings = APP((state) => state.settings);
    const data = DATA((state) => state.data);

    const datasets = Array.from({ length: setCount }, (_, i) => {
        const key = `value_${i + 1}`;
        const sensor = settings.dash_charts[key].value;
        const value = data[sensor];
        const type = settings.dash_charts[key].type;
        const config = modules[type]((state) => state.settings.sensors[sensor]);

        return {
            label: config.label,
            color: 'var(--themeDefault)',
            yMin: config.min_value,
            yMax: config.max_value,
            data: value,
        };
    });

    // Initialize dataStreams and recordedData with empty arrays for each dataset
    const [dataStreams, setDataStreams] = useState(datasets.map(() => Array(steps).fill(0)));
    const [recordedData, setRecordedData] = useState(datasets.map(() => [])); // Empty arrays for each dataset
    const [isRecording, setIsRecording] = useState(false); // State to toggle recording

    const generateColors = () => {
        const baseColor = color_dash_charts.replace(/#/g, '');
        const hsbColor = convert.hex.hsv(baseColor);
        return datasets.map((_, i) => {
            const hue = (hsbColor[0] + i * 25) % 360;
            return `#${convert.hsv.hex([hue, hsbColor[1], hsbColor[2]])}`;
        });
    };

    const colors = generateColors();

    const renderGrid = () => {
        const xStep = width / tickCountX;
        const yStep = height / tickCountY;

        const gridLines = [];

        for (let i = 1; i < tickCountX; i++) {
            gridLines.push(
                <line
                    key={`x-${i}`}
                    x1={i * xStep}
                    y1={0}
                    x2={i * xStep}
                    y2={height}
                    stroke={color_xGrid}
                    strokeWidth="1"
                />
            );
        }

        for (let i = 1; i < tickCountY; i++) {
            gridLines.push(
                <line
                    key={`y-${i}`}
                    x1={0}
                    y1={i * yStep}
                    x2={width}
                    y2={i * yStep}
                    stroke={color_yGrid}
                    strokeWidth="1"
                />
            );
        }

        return gridLines;
    };

    const catmullRomSpline = (p0, p1, p2, p3, t) => {
        const t2 = t * t;
        const t3 = t2 * t;

        const f0 = -t3 + 2 * t2 - t;
        const f1 = 3 * t3 - 5 * t2 + 2;
        const f2 = -3 * t3 + 4 * t2 + t;
        const f3 = t3 - t2;

        const x = 0.5 * (p0.x * f0 + p1.x * f1 + p2.x * f2 + p3.x * f3);
        const y = 0.5 * (p0.y * f0 + p1.y * f1 + p2.y * f2 + p3.y * f3);

        return { x, y };
    };

    const renderCurve = () => {
        const leftOffset = -5;
        const rightOffset = -5;

        const paths = datasets.map((dataset, i) => {
            const points = [];
            const yScale = height / (dataset.yMax - dataset.yMin);

            dataStreams[i].forEach((value, j) => {
                if (value !== null) {
                    const x = ((j / (steps - 2)) * width) + leftOffset;
                    const y = height - (value - dataset.yMin) * yScale;
                    points.push({ x, y });
                }
            });

            let pathData = "";
            for (let j = 1; j < points.length - 2; j++) {
                const p0 = points[j - 1];
                const p1 = points[j];
                const p2 = points[j + 1];
                const p3 = points[j + 2];

                for (let t = 0; t <= 1; t += 0.1) {
                    const point = catmullRomSpline(p0, p1, p2, p3, t);
                    pathData += j === 1 && t === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`;
                }
            }

            pathData += `L${width + rightOffset},${points[points.length - 1].y}`;

            return (
                <path
                    key={i}
                    d={pathData}
                    fill="none"
                    stroke={colors[i]}
                    strokeWidth="2"
                />
            );
        });

        return paths;
    };

    const renderDots = () => {
        const dots = datasets.map((dataset, i) => {
            const yScale = height / (dataset.yMax - dataset.yMin);

            return dataStreams[i].map((value, j) => {
                if (value !== null) {
                    const x = (j * resolution / length) * width;
                    const y = height - (value - dataset.yMin) * yScale;

                    return (
                        <circle
                            key={`dot-${i}-${j}`}
                            cx={x}
                            cy={y}
                            r="3"
                            fill={colors[i]}
                        />
                    );
                }
                return null;
            });
        });

        return dots;
    };

    const handleExport = () => {
        const date = new Date();
        const timestamp = date.toISOString().replace(/[-:T.]/g, '_'); // Format timestamp for the filename

        const exportObj = datasets.map((dataset, i) => {
            return {
                label: dataset.label,
                data: recordedData[i].map((value) => ({
                    timestamp: value.timestamp, // Use the stored timestamp for each data point
                    value: value.value
                }))
            };
        });

        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        saveAs(blob, `v-link_record_${timestamp}.json`);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            const newDataStreams = datasets.map((dataset, index) => {
                let value = Math.abs(dataset.data);
                if (isNaN(value)) value = 0;
                value = Math.max(dataset.yMin, Math.min(dataset.yMax, value));

                return [value, ...dataStreams[index].slice(0, steps - 1)];
            });

            setDataStreams(newDataStreams);

            // Only update recorded data if we're recording
            if (isRecording) {
                const updatedRecordedData = datasets.map((dataset, index) => {
                    const newData = [{
                        value: dataStreams[index][0],
                        timestamp: new Date().toISOString() // Capture timestamp when data arrives
                    }, ...recordedData[index].slice(0, steps - 1)];

                    return newData;
                });
                setRecordedData(updatedRecordedData);
            }
        }, resolution);

        return () => clearInterval(timer);
    }, [dataStreams, isRecording]);

    const handleToggleRecording = () => {
        if (isRecording) {
            handleExport(); // Export data when the user stops the recording
        }
        setIsRecording(!isRecording); // Toggle the recording state
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor,
                borderRadius: '7px',
                overflow: 'hidden',
                position: 'relative',
                alignSelf: 'flex-start'
            }}
        >
            <svg width={width} height={height} style={{ backgroundColor }}>
                {renderGrid()}
                {interpolation ? renderCurve() : renderDots()}
            </svg>

            <div
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {datasets.map((dataset, i) => (
                    <div
                        key={i}
                        style={{
                            color: colors[i],
                            borderRadius: '5px',
                            fontSize: '14px',
                        }}
                    >
                        {dataset.label}
                    </div>
                ))}
            </div>

            <button
                onClick={handleToggleRecording}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',  // Remove background to only show the SVG
                    border: 'none',      // Remove default button border
                    padding: '0',
                    cursor: 'pointer',
                    outline: 'none',     // Remove default outline on focus
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <svg
                    width="30"
                    height="30"
                    viewBox="0 0 40 40"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        fill: isRecording ? 'red' : color_xGrid, // Change color based on recording state
                        borderRadius: '50%',
                        stroke: 'black',  // Black outline for the button
                        strokeWidth: 4,   // Set outline thickness
                    }}
                >
                    {/* Outer circle (the button's background) */}
                    <circle cx="15" cy="15" r="15" />
                    {/* Inner circle (the gap in the middle) */}
                    <circle cx="15" cy="15" r="8" fill={isRecording ? 'red' : color_xGrid} />
                </svg>
            </button>

        </div>
    );
};

export default LineChart;
