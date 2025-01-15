import { useState, useEffect, useRef } from 'react';
import styled, { css, useTheme } from 'styled-components';

import { ToggleSwitch, Select, Input, Button, Link } from '../../../theme/styles/Inputs';
import { IconSmall, IconMedium, IconExtraLarge } from '../../../theme/styles/Icons';
import { Fade, GlowLarge } from '../../../theme/styles/Effects';
import { NavBlocker, FlexBox } from '../../../theme/styles/Container'
import { Typography } from '../../../theme/styles/Typography';

import { APP, KEY } from '../../../store/Store';



function Carplay() {
    const theme = useTheme()

    const Body2 = Typography.Body2

    /* Fade Content */
    const [fadeClass, setFadeClass] = useState('');

    useEffect(() => {
        // Add a small delay to ensure transition works
        const timeout = setTimeout(() => {
            setFadeClass('fade-in');
        }, 0); // Can also use a small positive value if needed (e.g., 50ms)

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    const onClick = () => {
        console.log(isActive)
        setIsActive(!isActive)
    };

    const [isActive, setIsActive] = useState(false)


    return (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Fade className={fadeClass}>
                <Body2>CONNECT PHONE OR CLICK TO PAIR DONGLE.</Body2>
                <Link onClick={() => onClick()} isActive={isActive}>
                    <FlexBox>
                        <IconExtraLarge
                            isActive={isActive}
                            theme={theme}
                            color={isActive ? theme.colors.theme.blue.active : theme.colors.medium}>
                            <use xlinkHref={`/assets/svg/buttons/link.svg#link`}></use>
                        </IconExtraLarge>
                    </FlexBox>
                </Link>
            </Fade>
        </div>
    );
}

export default Carplay;
