import { DATA, APP } from '../../store/Store';

const cos = Math.cos;
const sin = Math.sin;
const π = Math.PI;

const f_matrix_times = (([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y]);
const f_rotate_matrix = (x => [[cos(x), -sin(x)], [sin(x), cos(x)]]);
const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);

export const RadialGauge = ({
    sensor,
    type,

    globalRotation = 90,
    size = 100,
    arc = 270,

    borderSize = 0,
    borderGap = 0,

    progressOffset = -30,
    progressWidth = 5,

    limitOffset = -5,
    limitWidth = 2,

    tickWidth = 1,
    smallTicks = 4,
    heightSmallTicks = 2,
    bigTicks = 5,
    heightBigTicks = 10,

    needleOffset = -30,
    needleWidth = 2,
    pivotSize = 15,

    borderColor = 'black',
    backgroundColor = 'black',
    progressBackgroundColor = 'grey',
    progressFillerColor = 'white',
    tickColor = 'grey',
    limitColor = 'red',
    needleColor = 'red',
    textColor1 = 'grey',
    textColor2 = 'white',
    pivotColor = 'grey',
}) => {
    
    // Load Settings
    let value = DATA((state) => state.data[sensor])
    const modules = APP((state) => state.modules);
  
    // Load interface config based on type
    const store = modules[type];
    const settings = store ? store((state) => state.settings.sensors[sensor]) : {};
    const label = settings.label
  
    const maxValue = settings.max_value
    const limitStart = settings.limit_start


    if (arc > 359)
        arc = 359
    if (arc < 1)
        arc = 1

    if (heightSmallTicks > heightBigTicks)
        heightSmallTicks = heightBigTicks

    if (isNaN(value))
        value = 0;

    if (value > maxValue) {
        value = maxValue;
    }

    const percent1 = (value / maxValue) * 100;
    const percent2 = (limitStart / maxValue) * 100;

    smallTicks = (bigTicks) * (smallTicks + 1)

    // Center of Gauge
    const cx = size / 2;
    const cy = size / 2;

    // Radius of gauge
    const radius = Math.max((size - (borderSize * 4)) / 2, 0);

    // Radius for progress circle
    const radius_1 = Math.max(radius + progressOffset, 0);

    //Radius for limit circle
    const radius_2 = Math.max(radius + limitOffset, 0);

    //Radius big ticks
    const radius_3 = Math.max((size - (heightBigTicks / 2) - borderSize - borderGap) / 2, 0);

    //Radius small ticks
    const radius_4 = Math.max( (size - (heightBigTicks - heightSmallTicks / 2) - borderSize - borderGap) / 2, 0);


    const t1 = 0;
    let Δ = arc;
    let φ = globalRotation;
    let ε1 = Δ * (percent1 / 100);
    let ε2 = Δ * (percent2 / 100);
    const δ = (360 - Δ) / 2;

    φ = φ + δ;

    Δ = Δ * π / 180;
    φ = φ * π / 180;
    ε1 = ε1 * π / 180;
    ε2 = ε2 * π / 180;

    const arcBigTicks = Δ * radius_3;
    const arcSmallTicks = Δ * radius_4;

    Δ = Δ % (2 * π);

    const rotMatrix = f_rotate_matrix(φ);

    const computeCoordinates = (angle, radius) => {
        const vector = [radius * cos(angle), radius * sin(angle)];
        const rotatedVector = f_matrix_times(rotMatrix, vector);
        return f_vec_add(rotatedVector, [cx, cy]);
    };


    // Get start and end points for progress circle
    const [circle1_sx, circle1_sy] = computeCoordinates(t1, radius_1);
    const [circle1_ex1, circle1_ey1] = computeCoordinates(t1 + Δ, radius_1);

    // Get end points for filler circle
    const [circle1_ex2, circle1_ey2] = computeCoordinates(t1 + ε1, radius_1);

    // Get start and end points for progress circle
    const [circle2_sx, circle2_sy] = computeCoordinates(t1 + ε2, radius_2);
    const [circle2_ex, circle2_ey] = computeCoordinates(t1 + Δ, radius_2);

    // Get start and end points for big ticks
    const [circle3_sx, circle3_sy] = computeCoordinates(t1, radius_3);
    const [circle3_ex, circle3_ey] = computeCoordinates(t1 + Δ, radius_3);

    // Get start and end points for big ticks
    const [circle4_sx, circle4_sy] = computeCoordinates(t1, radius_4);
    const [circle4_ex, circle4_ey] = computeCoordinates(t1 + Δ, radius_4);

    // Get needle end point
    const [needle_sx, needle_sy] = computeCoordinates(t1 + ε1, radius_2 + needleOffset);


    const fA1 = ((Δ > π) ? 1 : 0);
    const fS1 = ((Δ > 0) ? 1 : 0);
    const fA2 = ((ε1 > π) ? 1 : 0);
    const fS2 = ((ε1 > 0) ? 1 : 0);
    const fA3 = ((ε2 > Δ) ? 1 : 0);
    const fS3 = ((ε2 > 0) ? 1 : 0);

    const interval = maxValue / bigTicks;
    const values = [];

    for (let i = 0; i < bigTicks; i++) {
        values[i] = interval * i;
    }

    return (
        <>
            <svg
                height={size}
                width={size}
            >
                <circle                             //Background Circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill={backgroundColor}
                    stroke={borderColor}
                    strokeWidth={borderSize}
                />

                <path className="base"              //Progress Circle Base
                    strokeWidth={progressWidth}
                    strokeLinecap="round"
                    fill='none'
                    stroke={progressBackgroundColor}
                    d={`M ${circle1_sx},${circle1_sy} A ${radius_1},${radius_1},${φ / (2 * π) * 360},${fA1} ${fS1} ${circle1_ex1},${circle1_ey1}`}
                />

                <path className="filler"            //Progress Circle Filler
                    strokeWidth={progressWidth}
                    strokeLinecap="round"
                    fill='none'
                    stroke={progressFillerColor}
                    d={`M ${circle1_sx},${circle1_sy} A ${radius_1},${radius_1},${ε1 / (2 * π) * 360},${fA2} ${fS2} ${circle1_ex2},${circle1_ey2}`}
                />

                <path className="limit"             //Limit Circle
                    stroke-location="outside"
                    strokeWidth={limitWidth}
                    fill='none'
                    stroke={limitColor}
                    d={`M ${circle2_sx},${circle2_sy} A ${radius_2},${radius_2},${ε2 / (2 * π) * 360},${fA3} ${fS3} ${circle2_ex},${circle2_ey}`}
                />

                <path className="bigTicks"          //Big Ticks
                    stroke-location="outside"
                    strokeWidth={heightBigTicks}
                    fill='none'
                    stroke={tickColor} strokeDasharray={`${tickWidth} ${(arcBigTicks - ((tickWidth * bigTicks) + tickWidth)) / bigTicks}`}
                    d={`M ${circle3_sx},${circle3_sy} A ${radius_3},${radius_3},${ε1 / (2 * π) * 360},${fA1} ${fS1} ${circle3_ex},${circle3_ey}`}
                />

                <path className="smallTicks"        //Small Ticks
                    stroke-location="outside"
                    strokeWidth={heightSmallTicks}
                    fill='none'
                    stroke={tickColor}
                    strokeDasharray={`${tickWidth} ${(arcSmallTicks - ((tickWidth * smallTicks) + tickWidth)) / smallTicks}`}
                    d={`M ${circle4_sx},${circle4_sy} A ${radius_4},${radius_4},${ε1 / (2 * π) * 360},${fA1} ${fS1} ${circle4_ex},${circle4_ey}`}
                />

                <line                               //Indicator
                    x1={cx}
                    y1={cy}
                    x2={needle_sx}
                    y2={needle_sy}
                    strokeWidth={needleWidth}
                    stroke={needleColor}
                />

                <circle                             //Center
                    cx={cx}
                    cy={cy}
                    r={pivotSize / 2}
                    fill={pivotColor}
                />

                <text                               //Title Label
                    className="gauge_titleLabel"
                    fill={textColor1}
                    fontSize={(0.5 / 10) * size}
                    x="50%"
                    y="30%"
                    dy="20px"
                    textAnchor="middle"
                >
                    {`${label}`}
                </text>

                <text                               //Unit Label
                    className="gauge_unitLabel"
                    fill={textColor1}
                    fontSize={(0.5 / 10) * size}
                    x="50%"
                    y="78%"
                    dy="20px"
                    textAnchor="middle"
                >
                    {`(${settings.unit})`}
                </text>

                <text                               //Value Label
                    className="gauge_valueLabel"
                    fill={textColor2}
                    fontSize={(1.2 / 10) * size}
                    x="50%"
                    y="70%"
                    dy="20px"
                    textAnchor="middle"
                >
                    {`${value}`}
                </text>
            </svg>
        </>
    );

};

export default RadialGauge;