const ValueBox = ({
  textColor,
  limitColor,
  boxColor,
  borderColor,
  borderWidth,
  height,
  width,
  valueKey,
  carData,
  sensorSettings
}) => {
  const value = carData[valueKey];
  const sensorSetting = sensorSettings[valueKey];
  const label = sensorSettings[valueKey].label

  const getColorStyle = () => ({
    color: `${value >= sensorSetting.limit_start ? limitColor : textColor}`,
  });

  const boxStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    flexDirection: 'column',
    height: height,
    width: width,
    borderRadius: '10px',
    backgroundColor: boxColor,
    border: `${borderWidth}px solid ${borderColor}`
  };

  const labelStyle = {
    marginLeft: '.5rem',
    marginTop: '.2rem',
    height: '20%',
    color: textColor,
  };

  const dataStyle = {
    height: '80%',
    marginLeft: 'auto',
    marginRight: '1rem',
    fontSize: `${height / 2}px`,
    color: textColor,
  };


  return (
    <div className="value-box" style={boxStyle}>
      <div className="value-box__label" style={labelStyle}>
        {label}:
      </div>
      <div className="value-box__data" style={{ ...dataStyle, ...getColorStyle() }}>
        {value}
        {sensorSetting.unit}
      </div>
    </div>
  );
};

export default ValueBox;