import "../components/themes.scss"
import { useState, useEffect, } from "react";

const ProgressBar = ({ currentValue, maxValue, unit, warning, theme }) => {

    const [background, setBackground] = useState('var(--fillInactive)');
    const [text, setText] = useState('var(--textColorActive)');
    const [progress, setProgress] = useState(0);

    useEffect(() => {

        console.log(currentValue)
        
        setProgress((currentValue / maxValue) * 100);

        console.log(progress);

        if (currentValue < warning) {
            setBackground('var(--textColorInactive)')
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
        textAlign: 'left'
    }

    const labelStyles = {
        padding: 5,
        fontWeight: 'bold',
        color: text
    }

    return (
        <div className={`progressBar ${theme}`} style={containerStyles}>
           
            <div style={fillerStyles}> <span style={labelStyles}>{`${currentValue}`}{`${unit}`}</span></div>
        </div>
    );
};

export default ProgressBar;
