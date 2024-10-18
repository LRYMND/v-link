import { DATA, APP } from '../../store/Store';


const ValueBox = ({
  sensor,
  type,
  unit = true,

  textColorDefault,
  valueColor,
  limitColor,
  boxColor,
  borderColor,

  borderWidth = '1vh',
  style = 'row',

  height,
  width = '100%',

  labelSize = '3vh',
  valueSize = '6vh',
}) => {

  // Load Settings
  const value = DATA((state) => state.data[sensor])
  const modules = APP((state) => state.modules);
  
  // Load interface config based on type
  const store = modules[type];
  const settings = store ? store((state) => state.settings.sensors[sensor]) : {};


  return (
    <div className='value-box' style={{
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: style,
      height: height, 
      width: width,
      borderRadius: '10px',
      backgroundColor: boxColor,
      border: `${borderWidth} solid ${borderColor}`
    }}>
      <div className='value-box__label' style={{
        alignSelf: 'flex-start',
        marginLeft: '1%',
        marginTop: '1%',
        fontSize: labelSize,
        color: textColorDefault,
      }}>
        {settings.label}:
      </div>
      <div className='value-box__data' style={{
        alignSelf: 'center',
        marginLeft: 'auto',
        marginRight: '5%',
        fontSize: valueSize,
        color: value >= settings.limit_start ? limitColor : valueColor,
      }}>
        {value}
        {unit && settings.unit}
      </div>
    </div>
  );
};

export default ValueBox;
