import "../components/themes.scss"
import { useState, useEffect, } from "react";

const ProgressBar = (props) => {
    const { currentValue, maxValue, unit, warning, theme } = props;

    const [background, setBackground] = useState('var(--fillInactive)');
    const [text, setText] = useState('var(--textColorActive)');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        
        setProgress((maxValue / 100) * currentValue);

        if (currentValue < warning) {
            setBackground('var(--fillInactive)')
            setText('var(--textColorActive)')
        } else {
            setBackground('var(--fillActive)')
            setText('var(--fillInactive)')
        }

        return function cleanup() {

        };

    }, [currentValue]);

    const containerStyles = {
        height: 20,
        width: '100%',
        backgroundColor: 'var(--buttonBackground)',
        borderRadius: 50,
        textAlign: 'center',
    }

    const fillerStyles = {
        height: '100%',
        width: `${progress}%`,
        backgroundColor: background,
        borderRadius: 'inherit',
        textAlign: 'right'
    }

    const labelStyles = {
        padding: 5,
        fontWeight: 'bold',
        color: text
    }

    return (
        <div className={`progressBar ${theme}`} style={containerStyles}>
            <span style={labelStyles}>{`${currentValue}`}{`${unit}`}</span>
            <div style={fillerStyles} />
        </div>
    );
};

export default ProgressBar;
