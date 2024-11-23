const SimpleInput = ({ name, type, value, textSize, textScale, textColor, isActive, onChange }) => {
  const inputStyle = {
    flex: '0 1 30px',
    fontSize: `${textSize * textScale}vh`,
    height: '4vw',
    width: '98%',

    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    border: 0,

    borderRadius: '10px',
    color: textColor,
    backgroundColor: isActive ? 'var(--boxColorDarker)' : 'var(--boxColorDark)',
    cursor: isActive ? 'pointer' : 'default',
  };

  const handleChange = () => {
    if (isActive && onChange) {
      onChange(event);
    }
  };

  return (
    <input className='simple-input'
    style={inputStyle}
    type={type}
    name={name}
    defaultValue={value}
    onChange={handleChange} />

  );
};

export default SimpleInput;