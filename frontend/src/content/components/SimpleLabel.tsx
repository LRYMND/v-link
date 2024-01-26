const SimpleLabel = ({ text, textSize, textScale, textColor }) => {
    const labelStyle = {
      display: 'flex',
      fontSize: `${textSize * textScale}vh`,
      color: textColor,
    };

  
    return (
      <div className={'simple-label'} style={labelStyle}>
        {text}
      </div>
    );
  };
  
  export default SimpleLabel;