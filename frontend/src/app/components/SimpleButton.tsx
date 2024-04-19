const SimpleButton = ({name='button', height='80%', width='100%', text, textSize, textScale, textColor, isActive, backgroundColor, onClick }) => {
  const buttonStyle = {
    flex: '1 1 30px',
    fontSize: `${textSize * textScale}vh`,
    height: height,
    width: width,
    borderRadius: '10px',
    color: textColor,
    backgroundColor: backgroundColor,
    cursor: isActive ? 'pointer' : 'default',
  };

  const handleButtonClick = () => {
    if (isActive && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`input-style ${isActive ? 'active' : 'inactive'}`}
      name={name}
      style={buttonStyle}
      onClick={handleButtonClick}
      disabled={isActive ? false : true}
    >
      {text}
    </button>
  );
};

export default SimpleButton;