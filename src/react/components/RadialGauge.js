import React from "react";

const cos = Math.cos;
const sin = Math.sin;
const π = Math.PI;

const f_matrix_times = (([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y]);
const f_rotate_matrix = (x => [[cos(x), -sin(x)], [sin(x), cos(x)]]);
const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);

export const RadialGauge = ({
    size = 100,
    arc = 270,
    globalRotation = 90,

    title = 'Gauge',
    unit = 'Units',
    currentValue,
    maxValue = 100,

    borderSize = 0,
    borderGap = 0,

    progressRadius = 70,
    progressWidth = 5,

    bigTicks = 5,
    smallTicks = 4,
    heightBigTicks = 10,
    heightSmallTicks = 2,
    tickWidth = 1,

    needleLength = 80,
    needleWidth = 2,
    pivotSize = 15,

    limitRadius = 80,
    limitWidth = 2,
    limitStart = 70,

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

    if (arc > 359)
        arc = 359
    if (arc < 1)
        arc = 1

    if (heightSmallTicks > heightBigTicks)
        heightSmallTicks = heightBigTicks

    if (currentValue > maxValue) {
        currentValue = maxValue;
    }

    let percent1 = (currentValue / maxValue) * 100;
    let percent2 = (limitStart / maxValue) * 100;

    smallTicks = (bigTicks) * (smallTicks + 1)

    let cx = size                                                                       //Center
    let cy = cx

    let rx1 = progressRadius                                                            //Radius of inner circle
    let ry1 = rx1

    let rx2 = size - (heightBigTicks / 2) - borderSize - borderGap                      //Radius of big ticks
    let ry2 = rx2

    let rx3 = size - (heightBigTicks - heightSmallTicks / 2) - borderSize - borderGap   //Radius of small ticks
    let ry3 = rx3

    let rx4 = limitRadius                                                               //Radius of limit
    let ry4 = rx4


    let t1 = 0                                                                          //Start angle (Userdefined)
    let Δ = arc                                                                         //Sweep angle (Userdefined)
    let φ = globalRotation                                                              //Global rotation (Userdefined)
    let ε1 = Δ * (percent1 / 100)                                                       //Progress-End
    let ε2 = Δ * (percent2 / 100)                                                       //Limit-Start

    let δ = (360 - Δ) / 2                                                               //Orient gap to global rotation
    φ = φ + δ

    Δ = Δ * π / 180;
    φ = φ * π / 180;
    ε1 = ε1 * π / 180;
    ε2 = ε2 * π / 180;

    let arcBigTicks = Δ * rx2
    let arcSmallTicks = Δ * rx3

    Δ = Δ % (2 * π);

    const rotMatrix = f_rotate_matrix(φ);

    //Progress Start
    const [sX1, sY1] = (f_vec_add(f_matrix_times(rotMatrix, [rx1 * cos(t1), ry1 * sin(t1)]), [cx, cy]));


    //Background End
    const [eX1, eY1] = (f_vec_add(f_matrix_times(rotMatrix, [rx1 * cos(t1 + Δ), ry1 * sin(t1 + Δ)]), [cx, cy]));
    const fA1 = ((Δ > π) ? 1 : 0);
    const fS1 = ((Δ > 0) ? 1 : 0);


    //Filler End
    const [eX2, eY2] = (f_vec_add(f_matrix_times(rotMatrix, [rx1 * cos(t1 + ε1), ry1 * sin(t1 + ε1)]), [cx, cy]));
    const fA2 = ((ε1 > π) ? 1 : 0);
    const fS2 = ((ε1 > 0) ? 1 : 0);


    //BigTicks
    const [sX2, sY2] = (f_vec_add(f_matrix_times(rotMatrix, [rx2 * cos(t1), ry2 * sin(t1)]), [cx, cy]));
    const [eX3, eY3] = (f_vec_add(f_matrix_times(rotMatrix, [rx2 * cos(t1 + Δ), ry2 * sin(t1 + Δ)]), [cx, cy]));


    //SmallTicks
    const [sX3, sY3] = (f_vec_add(f_matrix_times(rotMatrix, [rx3 * cos(t1), ry3 * sin(t1)]), [cx, cy]));
    const [eX4, eY4] = (f_vec_add(f_matrix_times(rotMatrix, [rx3 * cos(t1 + Δ), ry3 * sin(t1 + Δ)]), [cx, cy]));


    //Needle Endpoint
    const [eX5, eY5] = (f_vec_add(f_matrix_times(rotMatrix, [needleLength * cos(t1 + ε1), needleLength * sin(t1 + ε1)]), [cx, cy]));


    //Limit
    const [sX4, sY4] = (f_vec_add(f_matrix_times(rotMatrix, [rx4 * cos(t1 + ε2), ry4 * sin(t1 + ε2)]), [cx, cy]));
    const [eX6, eY6] = (f_vec_add(f_matrix_times(rotMatrix, [rx4 * cos(t1 + Δ), ry4 * sin(t1 + Δ)]), [cx, cy]));
    const fA3 = ((ε2 > Δ) ? 1 : 0);
    const fS3 = ((ε2 > 0) ? 1 : 0);



    //Annotation 
    const interval = maxValue / (bigTicks)
    let values = [];

    for (let i = 0; i < bigTicks; i++) {
        values[i] = interval * i;
    }

    // x,y start position
    // rx,ry radius x and y
    // x1,y1 end position
    //<path d="M x,y A rx, ry, 0 1 1 x1, y1"/>

    return (
        <>

            <svg
                height={size * 2}
                width={size * 2}
            >
                <circle cx={(cx)} cy={(cy)} r={(size)} fill={(borderColor)} />
                <circle cx={(cx)} cy={(cy)} r={(size - borderSize)} fill={(backgroundColor)} />

                <path className="base" strokeWidth={progressWidth} strokeLinecap="round" fill='none'
                    stroke={(progressBackgroundColor)}
                    d={`M ${sX1},${sY1} A ${(rx1)},${(ry1)}, ${φ / (2 * π) * 360},${fA1} ${fS1} ${eX1},${eY1}`}
                />

                <path className="filler" strokeWidth={progressWidth} strokeLinecap="round" fill='none'
                    stroke={(progressFillerColor)}
                    d={`M ${sX1},${sY1} A ${(rx1)},${(ry1)}, ${ε1 / (2 * π) * 360},${fA2} ${fS2} ${eX2},${eY2}`}
                />

                <path className="bigTicks" stroke-location="outside" strokeWidth={heightBigTicks} fill='none'
                    stroke={(tickColor)} strokeDasharray={`${(tickWidth)} ${((arcBigTicks - ((tickWidth * bigTicks) + tickWidth)) / (bigTicks))}`}
                    d={`M ${sX2},${sY2} A ${(rx2)},${(ry2)}, ${ε1 / (2 * π) * 360},${fA1} ${fS1} ${eX3},${eY3}`}
                />

                <path className="smallTicks" stroke-location="outside" strokeWidth={heightSmallTicks} fill='none'
                    stroke={(tickColor)} strokeDasharray={`${(tickWidth)} ${((arcSmallTicks - ((tickWidth * smallTicks) + tickWidth)) / (smallTicks))}`}
                    d={`M ${sX3},${sY3} A ${(rx3)},${(ry3)}, ${ε1 / (2 * π) * 360},${fA1} ${fS1} ${eX4},${eY4}`}
                />

                <path className="limit" stroke-location="outside" strokeWidth={limitWidth} fill='none'
                    stroke={(limitColor)}
                    d={`M ${sX4},${sY4} A ${(rx4)},${(ry4)}, ${ε2 / (2 * π) * 360},${fA3} ${fS3} ${eX6},${eY6}`}
                />
                <line x1={(cx)} y1={(cy)} x2={(eX5)} y2={(eY5)} strokeWidth={(needleWidth)} stroke={(needleColor)}></line>

                <text
                    className="gauge_titleLabel"
                    fill={(textColor1)}
                    fontSize="12px"
                    x="50%"
                    y="30%"
                    dy="20px"
                    textAnchor="middle"
                >
                    {`${title}`}
                </text>

                <text
                    className="gauge_unitLabel"
                    fill={(textColor1)}
                    fontSize="12px"
                    x="50%"
                    y="78%"
                    dy="20px"
                    textAnchor="middle"
                >
                    {`(${unit})`}
                </text>

                <text
                    className="gauge_valueLabel"
                    fill={(textColor2)}
                    fontSize="20px"
                    x="50%"
                    y="70%"
                    dy="20px"
                    textAnchor="middle"
                >
                    {`${currentValue}`}
                </text>

                <circle cx={(cx)} cy={(cy)} r={(pivotSize / 2)} fill={(pivotColor)} />‍
            </svg>
        </>
    );
};

export default RadialGauge;