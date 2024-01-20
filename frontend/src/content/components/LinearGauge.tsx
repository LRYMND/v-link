import { useState, useEffect } from 'react';

const LinearGauge = ({
    svgMask,
    width,
    height,
    padding,
    numberOfRectangles,
    spacing,
    title = 'Gauge',
    value1 = 0,
    unit1 = 'Units',
    limitStart,
    maxValue,
    value2 = 0,
    unit2 = 'Units',
    limitValue2,
    ticks = 2,
    smallTicks = 5,
    tickLength = 12,
    progressThickness = 3,
    limitThickness = 10,
    decimals = 2,
    textColorActive,
    textColorDefault,
    fillActive,
    fillInactive,
    sectionColor
}) => {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const minValue = 0;
    const offsetX = padding
    const offsetY = padding

    const [mask, setMask] = useState();
    const [indicator, setIndicator] = useState();

    const [indicatorLength, setIndicatorLength] = useState(0);
    const [limitX, setLimitX] = useState(0)
    const [barX, setBarX] = useState(0)
    const [tickMarks, setTickMarks] = useState()
    const [tickLimit, setTickLimit] = useState(0)

    const [limitPathStart, setLimitPathStart] = useState(0);
    const [limitPathEnd, setLimitPathEnd] = useState(0);



    const [ready, setReady] = useState(false)
    const [viewBox, setViewBox] = useState({ minX: 0, minY: 0, width: 0, height: 0 });

    let indicatorPath = null;

    useEffect(() => {
        // Function to extract information from the SVG file
        const extractInformationFromSVG = async () => {
            try {
                // Fetch the SVG file as text
                const response = await fetch(svgMask);
                const svgText = await response.text();

                // Create a DOMParser to parse the SVG text
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');

                // Extract viewBox attribute values
                const viewBoxAttribute = svgDoc.querySelector('svg').getAttribute('viewBox');
                const [minX, minY, width, height] = viewBoxAttribute.split(' ').map(Number);

                setViewBox({ minX, minY, width, height });



                // Extract path attributes
                const maskAttributes = svgDoc.getElementById('mask');
                const indicatorAttributes = svgDoc.getElementById('indicator');


                if (indicatorAttributes && maskAttributes) {
                    let dAttribute
                    dAttribute = indicatorAttributes.getAttribute('d');
                    setIndicator(dAttribute)
                    dAttribute = maskAttributes.getAttribute('d');
                    setMask(dAttribute)
                } else {
                    console.warn('SVG not fitting requirements. Need two paths with "mask" and "indicator" ID.');
                }
            } catch (error) {
                console.error('Error fetching or parsing SVG:', error);
            }


        };

        extractInformationFromSVG();
    }, []);

    useEffect(() => {
        if (indicator && mask) {
            // Use the original path element extracted from the SVG
            indicatorPath = document.createElementNS(SVG_NS, 'path');
            indicatorPath.setAttribute('d', indicator);

            setIndicatorLength(indicatorPath.getTotalLength());
            setLimitX(mapValue(limitStart, 0, maxValue, 0, indicatorPath.getTotalLength()))
        }
    }, [indicator, mask])

    useEffect(() => {
        if (indicator && mask) {


            // Use the original path element extracted from the SVG
            indicatorPath = document.createElementNS(SVG_NS, 'path');
            indicatorPath.setAttribute('d', indicator);

            const svgPoint = document.createElementNS(SVG_NS, 'svg').createSVGPoint();
            const point = indicatorPath.getPointAtLength(mapValue(value1, minValue, maxValue, 0, indicatorLength));
            svgPoint.x = (point.x * ((width - offsetX) / viewBox.width)) + (offsetX / 2);

            setBarX(svgPoint.x)
        }
    }, [value1, value2, indicator, mask])

    useEffect(() => {
        if (indicatorLength && limitX && mask) {
            setTickMarks(generateTickmarks())
        }
    }, [indicatorLength, limitX, width, height])

    useEffect(() => {
        if (tickMarks && limitPathStart && limitPathEnd) {
            setReady(true)
        }
    }, [limitPathStart, limitPathEnd])

    const checkData = (currentValue) => {
        if (isNaN(currentValue))
            currentValue = 0;

        if (currentValue > maxValue) {
            currentValue = maxValue;
        }
        return currentValue;
    }

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
                key={index}
                x={rectX}
                y={0}
                width={rectangleWidth}
                height={height}
                fill={isBeyondLimit ? 'red' : fillActive} // Set red color for rectangles beyond limitX
            />
        );
    });

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
                    fill={sectionColor}  // Adjust the background color
                />
                <text
                    x={label1_x}  // Adjust the x-coordinate for text position
                    y={label1_y}  // Adjust the y-coordinate for text position
                    fill={(value2 > limitValue2 ? "red" : textColorDefault)}  // Adjust the text color
                    fontSize={rect1_height / 2}  // Adjust the font size
                    textAnchor="middle"
                >
                    {checkData(value2)}  {/* Replace with your state variable */}
                </text>

                <text
                    x={label2_x}  // Adjust the x-coordinate for text position
                    y={label2_y}  // Adjust the y-coordinate for text position
                    fill={textColorDefault}  // Adjust the text color
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
                    fill={(value1 > limitStart ? "red" : textColorDefault)}  // Adjust the text color
                    fontSize={rect1_height}  // Adjust the font size
                    textAnchor="end"
                >
                    {checkData(value1)}   {/* Replace with your state variable */}
                </text>

                <text
                    x={rect1_x}  // Adjust the x-coordinate for text position
                    y={rect1_y}  // Adjust the y-coordinate for text position
                    fill={textColorDefault}  // Adjust the text color
                    fontSize={rect1_height / 2}  // Adjust the font size
                    textAnchor="start"
                >
                    {unit1}     {/* Replace with your state variable */}
                </text>
            </>
        );
    };

    // Function to remap an input to other value ranges.
    function mapValue(input, inputMin, inputMax, outputMin, outputMax) {
        const clampedInput = Math.min(Math.max(input, inputMin), inputMax);
        const inputPercentage = (clampedInput - inputMin) / (inputMax - inputMin);
        const mappedValue = outputMin + inputPercentage * (outputMax - outputMin);
        return mappedValue;
    }


    // Function to generate the Tickmarks and Limits
    function generateTickmarks() {
        const tickmarks = [];
        const textLabels = [];

        // Use the original path element extracted from the SVG
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', indicator);

        const svgPoint = document.createElementNS(SVG_NS, 'svg').createSVGPoint();
        const svgPoint2 = document.createElementNS(SVG_NS, 'svg').createSVGPoint();

        let check = true
        let limitBegin = 0;
        let limitEnd = 0;


        for (let i = 1; i <= (ticks); i++) {
            // Calculate the position along the path for each tickmark
            const position = ((i - 1) / (ticks - 1)) * indicatorLength;

            // Use getPointAtLength with transformation applied manually
            const point = path.getPointAtLength(position);
            svgPoint.x = (point.x * ((width - offsetX) / viewBox.width)) + (offsetX / 2);
            svgPoint.y = ((point.y + offsetY) * (((height - offsetY) / viewBox.height))) + ((offsetY / 2) - progressThickness);


            // Determine if the tickmark is beyond the limit
            const isBeyondLimit = parseFloat(position.toFixed(2)) >= parseFloat(limitX.toFixed(2));


            if (i === ticks) {
                limitEnd = position
                setLimitPathEnd(limitEnd)
            }

            if (isBeyondLimit && check) {
                limitBegin = position
                setLimitPathStart(limitBegin);
                setTickLimit(svgPoint.x)
                //limitPathStart = svgPoint.x;
                check = false;
            }

            // Create a tickmark at each position
            const tickmark = (
                <line
                    key={`tickmark-${i}`}
                    x1={svgPoint.x}
                    y1={svgPoint.y - tickLength}
                    x2={svgPoint.x}
                    y2={svgPoint.y} // Adjust the length of the tickmark as needed
                    stroke={isBeyondLimit ? 'red' : fillInactive} // Set red color for tickmarks beyond limitX
                    strokeWidth={isBeyondLimit ? limitThickness : progressThickness}
                />
            );

            tickmarks.push(tickmark);

            // Draw small tickmarks between existing tickmarks
            if (smallTicks && i < ticks) {
                const spacing = ((indicatorLength / ticks) / (smallTicks))


                for (let j = 1; j <= smallTicks; j++) {
                    const smallTickPosition = position + (spacing * j) - (progressThickness + smallTicks);

                    const point2 = path.getPointAtLength(smallTickPosition);
                    svgPoint2.x = (point2.x * ((width - offsetX) / viewBox.width)) + (offsetX / 2);
                    svgPoint2.y = (point2.y + offsetY) * (((height - offsetY) / viewBox.height)) + ((offsetY / 2) - progressThickness);

                    const smallTick = (
                        <line
                            key={`small-tick-${i}-${j}`}
                            x1={svgPoint2.x}
                            y1={svgPoint2.y - tickLength * 0.3 + (isBeyondLimit ? -progressThickness : 0)} // Adjust the length of the small tickmark as needed
                            x2={svgPoint2.x}
                            y2={svgPoint2.y} // Adjust the length of the small tickmark as needed
                            stroke={isBeyondLimit ? 'red' : fillInactive}  // Set the color for small tickmarks
                            strokeWidth={progressThickness} // Use the same strokeWidth as regular tickmarks
                        />
                    );

                    tickmarks.push(smallTick);
                }
            }

            // Create text label for each tickmark
            const textLabel = (
                <text
                    key={`text-label-${i}`}
                    x={svgPoint.x}
                    y={svgPoint.y - tickLength - 3} // 10px above the tickmark
                    textAnchor="middle" // Center the text horizontally
                    fill={isBeyondLimit ? 'red' : textColorDefault} // Set red color for labels beyond limitX
                >
                    {mapValue(i - 1, 0, ticks - 1, minValue, maxValue).toFixed(decimals)} {/* Adjust toFixed as needed */}
                </text>
            );

            textLabels.push(textLabel);
        }

        // Modify the existing path element to use strokeDasharray and strokeDashoffset
        const maskedPath = (
            <path
                d={indicator}
                transform={`translate(${(offsetX / 2)}, ${(offsetY)}) scale(${(width - offsetX) / viewBox.width}, ${(height - offsetY) / viewBox.height})`}
                fill="none"
                stroke="#ff0000"
                strokeLinecap="round"
                strokeWidth={`${limitThickness}`}
                strokeDasharray={`${limitEnd - limitBegin} ${limitBegin}`}
                strokeDashoffset={`${limitEnd - limitBegin}`}
            />
        );

        const indicatorPath = (
            <path
                d={indicator}
                transform={`translate(${(offsetX / 2)}, ${(offsetY)}) scale(${(width - offsetX) / viewBox.width}, ${(height - offsetY) / viewBox.height})`}
                fill="none"
                stroke={fillInactive}
                strokeWidth={`${progressThickness}`}
            />
        )

        return (
            <>
                {indicatorPath}
                {tickmarks}
                {textLabels}
                {maskedPath}
            </>
        )
    }

    return (
        <>
            {ready ?
                <svg width={width} height={height}>
                    <defs>
                        {/* Add custom Mask to LinearGauge */}
                        <clipPath id='mask' width={width - 10} height={height - offsetY}>
                            <path
                                id="mask"
                                data-name="SVGID"
                                d={mask}
                                transform={`translate(${(offsetX / 2)}, ${(offsetY)}) scale(${(width - offsetX) / viewBox.width}, ${(height - offsetY) / viewBox.height})`}
                            />
                        </clipPath>
                    </defs>
                    <g clipPath='url(#mask)'>
                        {rectangles}
                        <rect
                            x={barX}
                            y={0}
                            width={width}
                            height={height}

                            fill={fillInactive}
                        />
                    </g>

                    {tickMarks}
                    {label1()}
                    {label2()}
                </svg>
                : <></>}
        </>
    );
};

export default LinearGauge;
