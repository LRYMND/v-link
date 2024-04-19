const ValueBox = ({
  textColorDefault,
  valueColor,
  limitColor,
  boxColor,
  borderColor,
  borderWidth,
  height,
  width = "100%",
  unit = true,
  valueKey,
  carData,
  sensorSettings,
  labelSize,
  valueSize,
  style='row'
}) => {
  const value = carData[valueKey];
  const sensorSetting = sensorSettings[valueKey];
  const label = sensorSettings[valueKey].label

  const boxStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    //alignItems: 'center',
    flexDirection: style,
    height: height,
    width: width,
    borderRadius: '10px',
    backgroundColor: boxColor,
    border: `${borderWidth ? borderWidth : "1vh"} solid ${borderColor}`
  };

  const labelStyle = {
    alignSelf: 'flexStart',
    marginLeft: '1%',
    marginTop: '1%',
    fontSize: `${labelSize ? labelSize : "3vh"}`,
    color: textColorDefault,
  };

  const dataStyle = {
    alignSelf: 'center',
    marginLeft: 'auto',
    marginRight: '5%',
    fontSize: `${valueSize ? valueSize : "6vh"}`,
    color: `${value >= sensorSetting.limit_start ? limitColor : valueColor}`,
  };


  return (
    <div className="value-box" style={boxStyle}>
      <div className="value-box__label" style={labelStyle}>
        {label}:
      </div>
      <div className="value-box__data" style={{ ...dataStyle }}>
        {value}
        {unit && (sensorSetting.unit)}
      </div>
    </div>
  );
};

export default ValueBox;