const SimpleSelect = ({ name, value, options, textSize, textScale, textColor, isActive, onChange }) => {
    const inputStyle = {
        flex: '0 1 30px',
        fontSize: `${textSize * textScale}vh`,
        height: '4vw',
        width: '100%',
        borderRadius: '10px',
        textAlign: 'center',
        textDecoration: 'none',
        display: 'inline-block',
        color: textColor,
        backgroundColor: isActive ? 'var(--boxColorDarker)' : 'var(--boxColorDark)',
        cursor: isActive ? 'pointer' : 'default',
    };

    const handleChange = (event) => {
        if (isActive && onChange) {
            onChange(event);
        }
    };

    return (
        <select className='button__round input input-style'
            style={inputStyle}
            name={name}
            value={value}
            onChange={handleChange}>
            {options.map((option) => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    );
};

export default SimpleSelect;