import "../themes.scss";

const ProgressBar = ({ currentValue, maxValue, unit, warning, theme, textColor, progressColor, fillColor, backgroundColor }) => {
    let height = 20;
    let width = 70;
    //let strokeWidth = width - height;

    //let cx1 = width / 2;
    let cy1 = height / 2;

    let sx1 = height / 2;
    let sy1 = cy1;

    let ex1 = width - height / 2;
    let ey1 = sy1;

    let borderRadius = 2;
    let bgHeight = height - borderRadius * 2;
    //let bgWidth = strokeWidth - borderRadius * 2;

    let sx2 = height / 2 + borderRadius / 2
    let sy2 = cy1

    let ex2 = width - height / 2 - borderRadius / 2
    let ey2 = sy1

    let length = ex1 - sx1;

    let percent = (currentValue / maxValue) * 100;
    let lengthProgress = (length / 100) * percent;

    let ex3 = sx1 + lengthProgress
    let ey3 = sy1;

    return (
        <div className={`progressBar ${theme}`}>
            <svg height={height} width={width}>
                <line x1={(sx1)} y1={(sy1)} x2={(ex1)} y2={(ey1)} strokeWidth={(height)} strokeLinecap="round" stroke={(backgroundColor)}></line>
                <line x1={(sx1)} y1={(sy1)} x2={(ex3)} y2={(ey3)} strokeWidth={(height)} strokeLinecap="round" stroke={(progressColor)}></line>
                <line x1={(sx2)} y1={(sy2)} x2={(ex2)} y2={(ey2)} strokeWidth={(bgHeight)} strokeLinecap="round" stroke={(fillColor)}></line>

                <text
                    className="gauge_unitLabel"
                    fill={(textColor)}
                    fontSize="10px"
                    x="65%"
                    y="50%"
                    dy="5px"
                    textAnchor="middle"
                >
                    {`${unit}`}
                </text>

                <text
                    className="gauge_valueLabel"
                    fill={(textColor)}
                    fontSize="12px"
                    x="35%"
                    y="50%"
                    dy="5px"
                    textAnchor="middle"
                >
                    {`${currentValue}`}
                </text>
            </svg>
        </div>
    );
};

export default ProgressBar;
