import { useState, useEffect } from 'react';
import { DATA, APP } from '../../store/Store';

const LinearGauge = ({
    sensor1,
    type1,
    sensor2,
    type2,
    svgMask,
    width,
    height,
    padding,
    numberOfRectangles,
    spacing,
    title = 'Gauge',
    bigTicks = 2,
    smallTicks = 5,
    tickLength = 12,
    progressColorThickness = 3,
    limitThickness = 10,
    decimals = 2,
    progressColor,
    textColor,
    limitColor,
    indicatorColor,
    backgroundColor
}) => {
    const SVG_NS = 'http://www.w3.org/2000/svg';

    // Load Settings
    const value1 = DATA((state) => state.data[sensor1])
    const value2 = DATA((state) => state.data[sensor2])
    const modules = APP((state) => state.modules);
    
    // Load interface config based on type
    const store1 = modules[type1];
    const settings1 = store1 ? store1((state) => state.settings.sensors[sensor1]) : {};

    const store2 = modules[type2];
    const settings2 = store2 ? store2((state) => state.settings.sensors[sensor2]) : {};


    const unit1 = settings1.unit
    const limitStart = settings1.limit_start

    const minValue = 0;
    const maxValue = settings1.max_value

    const unit2 = settings2.unit
    const limitValue2 = 1.0;


    const [svg, setSVG] = useState()
    const [ready, setReady] = useState(false)

    const [viewBox, setViewBox] = useState({ minX: 0, minY: 0, width: 0, height: 0 });
    const [scale, setScale] = useState({ x: 0, y: 0 })

    const [mask, setMask] = useState();
    const [indicator, setIndicator] = useState();

    const [indicatorLength, setIndicatorLength] = useState(0);
    const [indicatorLimitStart, setIndicatorLimitStart] = useState(0);
    const [indicatorLimitEnd, setIndicatorLimitEnd] = useState(0);

    const [progress, setProgress] = useState(0)
    const [progressLimit, setProgressLimit] = useState(0)
    const [tickLimit, setTickLimit] = useState(0)

    const [tickPositions, setTickPositions] = useState()





    // Function to remap an input to other value ranges.
    function mapValue(input, inputMin, inputMax, outputMin, outputMax) {
        const clampedInput = Math.min(Math.max(input, inputMin), inputMax);
        const inputPercentage = (clampedInput - inputMin) / (inputMax - inputMin);
        const mappedValue = outputMin + inputPercentage * (outputMax - outputMin);
        return mappedValue;
    }


    function checkData(currentValue) {
        if (isNaN(currentValue)) currentValue = 0;
        if (currentValue > maxValue) currentValue = maxValue;

        return currentValue;
    }


    // Load SVG
    useEffect(() => {
        const extractInformationFromSVG = async () => {
            try {
                /* Fetch content */
                const response = await fetch(svgMask);
                const svgText = await response.text();

                /* Parse content */
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');

                setSVG(svgDoc)
            } catch (error) {
                console.error('Error fetching or parsing SVG:', error);
            }
        };

        extractInformationFromSVG();

    }, [svgMask])


    // Parse SVG Content
    useEffect(() => {
        try {
            if (svg) {
                /* Extract attributes */
                const viewBoxAttribute = svg.querySelector('svg').getAttribute('viewBox');
                const [minX, minY, width, height] = viewBoxAttribute.split(' ').map(Number);

                setIndicatorLength(svg.getElementById('indicator').getTotalLength());
                setIndicator(svg.getElementById('indicator'));
                setViewBox({ minX, minY, width, height });
                setMask(svg.getElementById('mask'))
            }
        } catch (error) {
            console.warn('Failed to extract path attributes.');
        }
    }, [svg]);


    // Update Scaling
    useEffect(() => {
        setScale({

            x: (width - (padding * 2)) / viewBox.width,
            y: (height - (padding * 2)) / viewBox.height
        })
    }, [width, height, padding, viewBox, svg])


    // Set progress and limit coordinates
    useEffect(() => {
        if (indicator) {
            try {
            const svgPoint = document.createElementNS(SVG_NS, 'svg').createSVGPoint();
            const point = indicator.getPointAtLength(mapValue((isNaN(value1) ? 0 : value1), minValue, maxValue, 0, indicatorLength));
            svgPoint.x = (point.x * (scale.x)) + (padding);

            setProgress(checkData(svgPoint.x))
            setProgressLimit(mapValue(limitStart, 0, maxValue, 0, indicator.getTotalLength()))
        } catch(e) {
            console.log(e)
        }
        }
    }, [value1, value2, indicator, maxValue, indicatorLength, scale.x, padding, limitStart])


    // Calculate tick positions
    useEffect(() => {
        if (indicator && mask && scale && svg) {
            calculateTicks();
        }
    }, [indicator, mask, scale, svg]);


    // Set ready
    useEffect(() => {
        if (!ready && tickPositions) {
            setReady(true)
        }
    }, [progress, tickPositions])


    // Create an array of rectangles
    const rectangles = Array.from({ length: numberOfRectangles }, (_, index) => {
        let rectangleWidth = (width / numberOfRectangles) - spacing

        if (rectangleWidth <= 1)
            rectangleWidth = 1;
        spacing = (width / numberOfRectangles) - rectangleWidth

        const adjustedSpacing = Math.max(0, spacing);
        const actualSpacing = Math.max(1, adjustedSpacing);
        const rectX = index * (rectangleWidth + actualSpacing);
        const isBeyondLimit = rectX >= tickLimit;

        return (
            <rect
                key={`rectangle-${index})`}
                x={rectX}
                y={0}
                width={rectangleWidth}
                height={height}
                fill={isBeyondLimit ? limitColor : progressColor}
            />
        );
    });


    // Create the progress path
    const progressPath = () => {
        const attribute = mask.getAttribute('d');

        return (
            <>
                <defs>
                    <clipPath id='mask'>
                        <path
                            d={attribute}
                            width={width - (padding * 2)}
                            height={height - (padding * 2)}
                            transform={`translate(${padding}, ${padding}) scale(${scale.x}, ${scale.y})`}
                        />
                    </clipPath>
                </defs>

                <g clipPath='url(#mask)'>
                    {rectangles}
                    <rect
                        x={progress}
                        y={0}
                        width={width}
                        height={height}
                        fill={backgroundColor}
                    />
                </g>
            </>
        )
    }


    // Create the indicator path
    const indicatorPath = () => {
        const attribute = indicator.getAttribute('d');


        return (
            <path
                id='indicator'
                d={attribute}
                width={width - (padding * 2)}
                height={height - (padding * 2)}
                transform={`translate(${padding}, ${padding}) scale(${scale.x}, ${scale.y})`}
                strokeWidth={`${progressColorThickness}`}
                stroke={indicatorColor}
                fill="none"
            >
            </path>
        )
    }


    // Create the limit path
    const limitPath = () => {
        const attribute = indicator.getAttribute('d');

        return (
            <path
                id='limit'
                d={attribute}
                transform={`translate(${padding}, ${padding}) scale(${scale.x}, ${scale.y})`}
                fill="none"
                stroke={limitColor}
                strokeLinecap="round"
                strokeWidth={`${limitThickness * 0.7}`}
                strokeDasharray={`${indicatorLimitEnd - indicatorLimitStart} ${indicatorLimitStart}`}
                strokeDashoffset={`${indicatorLimitEnd - indicatorLimitStart}`}
            />
        )
    }

    // Create the tick paths
    const tickPaths = () => {
        const large = tickPositions.ticksLarge.map((tick, index) => (
            <g key={`labeledTick-${index}`}>
                <line
                    key={`bigTick-${index}`}
                    x1={tick.coordinate.x}
                    y1={tick.coordinate.y}
                    x2={tick.coordinate.x}
                    y2={tick.coordinate.y - tickLength}
                    strokeWidth={tick.isBeyondLimit ? limitThickness : progressColorThickness}
                    stroke={tick.isBeyondLimit ? limitColor : indicatorColor}
                />

                <text
                    key={`tickLabel-${index}`}
                    x={tick.coordinate.x}
                    y={tick.coordinate.y - tickLength - 3} // 10px above the tickmark
                    textAnchor="middle" // Center the text horizontally
                    fill={tick.isBeyondLimit ? limitColor : textColor}
                >
                    {mapValue(index, 0, bigTicks - 1, minValue, maxValue).toFixed(decimals)}
                </text>
            </g>
        ));

        const small = tickPositions.ticksSmall.map((tick, index) => (
            <line
                key={`smallTick-${index}`}
                x1={tick.coordinate.x}
                y1={tick.coordinate.y}
                x2={tick.coordinate.x}
                y2={tick.coordinate.y - (tickLength / 2)}
                strokeWidth={tick.isBeyondLimit ? limitThickness : progressColorThickness}
                stroke={tick.isBeyondLimit ? limitColor : indicatorColor}
            />
        ));

        return (
            <>
                {large}
                {small}
            </>
        );
    };


    // Function to calculate tick positions
    function calculateTicks() {
        let check = true;

        const ticksLarge = [];
        const ticksSmall = [];

        const svgPoint = document.createElementNS(SVG_NS, 'svg').createSVGPoint();

        /* Big Ticks */
        for (let i = 1; i <= bigTicks; i++) {
            const positionLarge = ((i - 1) / (bigTicks - 1)) * indicatorLength;
            const point = indicator.getPointAtLength(positionLarge);

            svgPoint.x = (point.x * scale.x) + padding;
            svgPoint.y = (point.y * scale.y) + padding;

            const coordinate = { x: svgPoint.x, y: svgPoint.y }
            const isBeyondLimit = parseFloat(positionLarge.toFixed(2)) >= parseFloat(progressLimit.toFixed(2));

            if (i === bigTicks) {
                setIndicatorLimitEnd(positionLarge)
            }

            if (isBeyondLimit && check) {
                setIndicatorLimitStart(positionLarge)
                setTickLimit(svgPoint.x)
                check = false;
            }

            ticksLarge.push({ coordinate, positionLarge, isBeyondLimit });

            /* Small Ticks */
            if (smallTicks && i < bigTicks) {
                const spacing = ((indicatorLength / (bigTicks - 1)) / (smallTicks + 1))

                for (let j = 1; j <= smallTicks; j++) {
                    const positionSmall = positionLarge + (spacing * j);
                    const point = indicator.getPointAtLength(positionSmall);

                    svgPoint.x = (point.x * scale.x) + padding;
                    svgPoint.y = (point.y * scale.y) + padding;

                    const coordinate = { x: svgPoint.x, y: svgPoint.y }

                    ticksSmall.push({ coordinate, positionSmall, isBeyondLimit });
                }
            }
        }

        setTickPositions({ ticksLarge: ticksLarge, ticksSmall: ticksSmall })
    }


    // Generate Text Labels
    const label1 = () => {

        const rect1_x = 0
        const rect1_y = 0

        const rect1_width = width / 9;
        const rect1_height = height / 3;

        const label1_x = rect1_x + (rect1_width / 2)
        const label1_y = rect1_y + (rect1_height / 2)

        const label2_x = rect1_x + (rect1_width / 2)
        const label2_y = rect1_y + (rect1_height * 0.9)

        return (
            <>
                <rect
                    x={rect1_x}  // Adjust the x-coordinate as needed
                    y={rect1_y}  // Adjust the y-coordinate as needed
                    width={rect1_width}  // Adjust the width as needed
                    height={rect1_height}  // Adjust the height as needed
                    rx={10}  // Adjust the border-radius for rounded edges
                    fill={backgroundColor}  // Adjust the background color
                />
                <text
                    x={label1_x}  // Adjust the x-coordinate for text position
                    y={label1_y}  // Adjust the y-coordinate for text position
                    fill={(value2 > limitValue2 ? limitColor : progressColor)}  // Adjust the text color
                    fontSize={rect1_height / 2}  // Adjust the font size
                    textAnchor="middle"
                >
                    {checkData(value2)}  {/* Replace with your state variable */}
                </text>

                <text
                    x={label2_x}  // Adjust the x-coordinate for text position
                    y={label2_y}  // Adjust the y-coordinate for text position
                    fill={textColor}  // Adjust the text color
                    fontSize={rect1_height / 4}  // Adjust the font size
                    textAnchor="middle"
                >
                    {unit2}  {/* Replace with your state variable */}
                </text>
            </>
        );
    };


    // Generate Text Labels
    const label2 = () => {

        const rect1_height = height / 3;

        const rect1_x = width * 0.8
        const rect1_y = height - (height / 10)

        return (
            <>
                <text
                    x={rect1_x}  // Adjust the x-coordinate for text position
                    y={rect1_y}  // Adjust the y-coordinate for text position
                    fill={(value1 > limitStart ? limitColor : progressColor)}  // Adjust the text color
                    fontSize={rect1_height}  // Adjust the font size
                    textAnchor="end"
                >
                    {checkData(value1)}   {/* Replace with your state variable */}
                </text>

                <text
                    x={rect1_x}  // Adjust the x-coordinate for text position
                    y={rect1_y}  // Adjust the y-coordinate for text position
                    fill={progressColor}  // Adjust the text color
                    fontSize={rect1_height / 2}  // Adjust the font size
                    textAnchor="start"
                >
                    {unit1}     {/* Replace with your state variable */}
                </text>
            </>
        );
    };


    return (
        <>
            {ready ?
                <svg width={width} height={height}>
                    {progressPath()}
                    {indicatorPath()}
                    {tickPaths()}
                    {limitPath()}
                    {label1()}
                    {label2()}
                </svg>
                : <></>}
        </>
    );
};

export default LinearGauge;
