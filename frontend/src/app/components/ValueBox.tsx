const ValueBox = ({
  textColorDefault,
  valueColor,
  limitColor,
  boxColor,
  borderColor,
  borderWidth = "1vh",
  height,
  width = "100%",
  unit = true,
  valueKey,
  carData,
  sensorSettings,
  labelSize = "3vh",
  valueSize = "6vh",
  style = 'row'
}) => {
  const value = carData[valueKey];
  const sensorSetting = sensorSettings[valueKey];
  const label = sensorSetting.label;

  return (
    <div className="value-box" style={{
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: style,
      height: height,
      width: width,
      borderRadius: '10px',
      backgroundColor: boxColor,
      border: `${borderWidth} solid ${borderColor}`
    }}>
      <div className="value-box__label" style={{
        alignSelf: 'flex-start',
        marginLeft: '1%',
        marginTop: '1%',
        fontSize: labelSize,
        color: textColorDefault,
      }}>
        {label}:
      </div>
      <div className="value-box__data" style={{
        alignSelf: 'center',
        marginLeft: 'auto',
        marginRight: '5%',
        fontSize: valueSize,
        color: value >= sensorSetting.limit_start ? limitColor : valueColor,
      }}>
        {value}
        {unit && sensorSetting.unit}
      </div>
    </div>
  );
};

export default ValueBox;
