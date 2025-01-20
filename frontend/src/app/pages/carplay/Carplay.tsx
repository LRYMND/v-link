import { useState, useEffect, useRef } from 'react';
import styled, { css, useTheme } from 'styled-components';

import { ToggleSwitch, Select, Input, Button, Link } from '../../../theme/styles/Inputs';
import { IconSmall, IconMedium, IconExtraLarge } from '../../../theme/styles/Icons';
import { Fade, GlowLarge } from '../../../theme/styles/Effects';
import { NavBlocker, FlexBox } from '../../../theme/styles/Container'
import { Typography } from '../../../theme/styles/Typography';

import { APP, KEY } from '../../../store/Store';

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;


function Carplay() {
    const app = APP((state) => state);
    const theme = useTheme()

    const Body2 = Typography.Body2

    const onClick = () => {
        console.log(isActive)

        app.update({system: { carplay: {...app.system.carplay, user: true }}})
        setIsActive(!isActive)
    };

    const [isActive, setIsActive] = useState(false)


    return (
        <Container>
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
        </Container>
    );
}

export default Carplay;
