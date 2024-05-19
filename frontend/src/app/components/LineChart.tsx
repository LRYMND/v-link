import { useState, useEffect, useRef } from 'react';
import { CarData, SensorSettings, ApplicationSettings } from '../../store/Store';

import convert from 'color-convert';

import "./../../themes.scss";
import "./../../styles.scss";

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

    //const label = SensorSettings((state) => state.sensorSettings[sensor].label);
    const applicationSettings = ApplicationSettings((state) => state.applicationSettings);
    const config = SensorSettings((state) => state.sensorSettings);
    

    const datasets = []

    for (let i = 1; i <= setCount; i++) {
        const key = "value_" + i

        const value = CarData((state) => state.carData[applicationSettings.dash_charts[key].value])

        datasets[i - 1] = {
            label: config[applicationSettings.dash_charts[key].value].label,
            color: 'var(--themeDefault)',
            yMin: config[applicationSettings.dash_charts[key].value].min_value,
            yMax: config[applicationSettings.dash_charts[key].value].max_value,
            data: value,
            interval: 100,  // Update with the desired interval in milliseconds
        }
    }

    const [ready, setReady] = useState(false)

    const [dataStreams, setDataStreams] = useState(datasets.map(dataset => Array.from({ length: length }, (_, index) => dataset.yMin)));
    const [colorVariations, setColorVariations] = useState([])

    const dataRefs = useRef(datasets.map(() => 0));

    useEffect(() => {
        if (colorVariations) setReady(true)
    }, [colorVariations])

    useEffect(() => {
        if (dataStreams) {
            const chartColors = generateColorVariations();
            setColorVariations(chartColors)
        }
    }, []);

    useEffect(() => {
        dataRefs.current = datasets.map((_, index) => datasets[index].data);
    }, [datasets]);

    useEffect(() => {
        const timer = setInterval(() => {
            const newDataStreams = dataRefs.current.map((dataRef, index) => {
                let value = Math.abs(dataRef);

                if (isNaN(value)) value = 0;
                if (value > datasets[index].yMax) value = datasets[index].yMax;
                if (value < datasets[index].yMin) value = datasets[index].yMin;

                const updatedDataStream = [value, ...dataStreams[index].slice(0, dataStreams[index].length - 1)];
                return updatedDataStream;
            });

            setDataStreams(newDataStreams);
        }, interval);

        return function cleanup() {
            clearInterval(timer);
        };
    }, [datasets, dataStreams, interval]);


    const generateColorVariations = () => {
        const hueStep = 25;         //    0 to 360
        const saturationStep = -10;  // -100 to 100
        const brightnessStep = 5;  //    0 to 100
        color_dash_charts = color_dash_charts.replace(/#/g, '');
    
        const hsbColor = convert.hex.hsv(color_dash_charts);
        const variations: string[] = [];
    
        for (let i = 0; i < dataStreams.length; i++) {
            const modifiedHsbColor = [
                (hsbColor[0] + i * hueStep) % 360,
                Math.min(100, Math.max(0, hsbColor[1] + saturationStep * i)),
                Math.min(100, Math.max(0, hsbColor[2] + brightnessStep * i))
            ];
    
            const variationColor = '#' + convert.hsv.hex(modifiedHsbColor);
            variations.push(variationColor);
        }
    
        return variations;
    };

    // Create the x data
    const xData = Array.from({ length: length }, (_, index) => index + 1)

    // Find the minimum and maximum values for the x data
    const xMin = Math.min(...xData);
    const xMax = Math.max(...xData);

    // Calculate the x and y scales
    const xScale = (width) / (xMax - xMin);
    const yScales = datasets.map(dataset => (height) / (dataset.yMax - dataset.yMin));

    //console.log(yScales)

    // Create the paths for the lines along with the labels
    const lineElements = datasets.map((dataset, datasetIndex) => {
        const dataPoints = xData.map((value, index) => ({
            x: (value - xMin) * xScale,
            y: (dataset.yMax - dataStreams[datasetIndex][index]) * yScales[datasetIndex]
        }));

        const path = dataPoints.reduce(
            (acc, point, index) =>
                index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`,
            ''
        );

        // Position of the label (next to the newest data point, which is the first in the array)
        const labelPosition = {
            x: dataPoints[0].x + 5, // Offset by 5 for spacing; adjust as needed
            y: dataPoints[0].y + (dataPoints[0].y >= (dataset.yMax - 20) ? -2 : +16),
        };

        return (
            <g key={datasetIndex}>
                <path d={path} stroke={colorVariations[datasetIndex]} strokeWidth="2" fill="none" />
                <text
                    x={labelPosition.x}
                    y={labelPosition.y}
                    fill={colorVariations[datasetIndex]}
                    fontSize="16"
                    textAnchor="start"
                >
                    {dataset.label}
                </text>
            </g>
        );
    });

    // Create X-Grid
    const xTicks = [];
    const tickDistance = (xMax - xMin) / tickCountX;

    for (let i = 0; i <= tickCountX; i++) {
        const xTick = xMin + i * tickDistance;
        const xTickPosition = (xTick - xMin) * xScale;

        xTicks.push(
            <g key={i}>
                <path
                    d={`M ${xTickPosition} 0 L ${xTickPosition} ${height}`}
                    stroke={color_xGrid}
                    strokeWidth="1"
                    fill="none"
                />
            </g>
        );
    }

    // Create Y-Grid
    const yTicks = [];

    datasets.forEach((dataset, datasetIndex) => {
        const yTickDistance = (dataset.yMax - dataset.yMin) / tickCountY;
        for (let i = 0; i <= tickCountY; i++) {
            const yTick = dataset.yMin + i * yTickDistance;
            const yTickPosition = height - ((yTick - dataset.yMin) * yScales[datasetIndex]);

            yTicks.push(
                <g key={`${datasetIndex}-${i}`}>
                    <path
                        d={`M 0 ${yTickPosition} L ${width} ${yTickPosition}`}
                        stroke={color_yGrid}
                        strokeWidth="1"
                        fill="none"
                    />
                </g>
            );
        }
    });

    return (

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", backgroundColor:`${backgroundColor}`}}>
            {ready ?
                <div className="chart">
                    <svg width={width} height={height}>
                        <path d={`M 2 ${height} L 2 0`} stroke={color_axis} strokeWidth="2" fill="none" />
                        {yTicks}
                        {xTicks}
                        {lineElements}
                    </svg>
                </div>
                : <></>}
        </div>
    );
};

export default LineChart;
