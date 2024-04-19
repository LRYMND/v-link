const SimpleCheckbox = ({ name, checked, colorActive, colorInactive, borderColor, isActive, onChange }) => {
    const inputStyle = {
        height: '4vh',
        width: '5vh',

        margin: 0,

        verticalAlign: 'text-bottom',

        border: `0.5vh solid ${borderColor}`,
        borderRadius: '10px',
        borderColor: borderColor,

        backgroundClip: 'content-box',
        backgroundColor: checked ? colorActive : colorInactive,

        cursor: isActive ? 'pointer' : 'default',
    };

    const handleChange = () => {
        if (isActive && onChange) {
            onChange(event);
        }
    };

    return (
        <input className='simple-checkbox'
            style={inputStyle}
            type={'checkbox'}
            name={name}
            checked={checked}
            onChange={handleChange} />
    );
};

export default SimpleCheckbox;