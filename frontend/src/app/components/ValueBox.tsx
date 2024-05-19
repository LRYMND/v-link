import { CarData, SensorSettings } from '../../store/Store';


const ValueBox = ({
  sensor,
  unit = true,

  textColorDefault,
  valueColor,
  limitColor,
  boxColor,
  borderColor,

  borderWidth = "1vh",
  style = "row",

  height,
  width = "100%",

  labelSize = "3vh",
  valueSize = "6vh",
}) => {

  const value = CarData((state) => state.carData[sensor])
  const label = SensorSettings((state) => state.sensorSettings[sensor].label);
  const config = SensorSettings((state) => state.sensorSettings[sensor]);


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
        color: value >= config.limit_start ? limitColor : valueColor,
      }}>
        {value}
        {unit && config.unit}
      </div>
    </div>
  );
};

export default ValueBox;
