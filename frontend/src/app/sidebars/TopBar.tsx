import { useState, useEffect } from "react";
import { APP } from '../../store/Store';
import styled, { useTheme } from 'styled-components';

import { IconSmall } from '../../theme/styles/Icons';
import { Caption1 } from '../../theme/styles/Typography';

const Topbar = styled.div`
  position: absolute;
  top: 0;
  z-index: 1;
  background: ${({ theme }) => theme.colors.gradients.gradient1};
  height: ${({ app }) => `${app.settings.side_bars.topBarHeight.value}px`};
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 5px 20px;
  gap: 10px;
`;

const Left = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const Middle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Right = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 10px;
`;

const Scroller = styled.div`
  position: relative; /* Necessary for absolute positioning of children */

  width: 100%;
  height: 30px; /* Fixed height for the scroller */

  overflow: hidden; /* Hide content outside the container */
`;

const ScrollerContent = styled.div`
  position: absolute; /* Stack children on top of each other */

  display: flex;
  justify-content: flex-start;
  align-items: center;

  width: 100%;
  height: 30px; /* Each child has a fixed height of 30px */
  gap: 10px;

  top: ${({ active }) => (active ? "0" : "30px")};
  transition: top 0.3s ease-in-out;


`;

const TopBar = () => {
  const app = APP((state) => state);
  const theme = useTheme();

  const [time, setDate] = useState(new Date());
  const [carplay, setCarplay] = useState(true);

  function updateTime() {
    setDate(new Date());
  }

  useEffect(() => {
    const timer1 = setInterval(updateTime, 10000);
    return () => clearInterval(timer1);
  }, []);

  useEffect(() => {
    setCarplay(app.system.streamState && app.system.view === 'Carplay');
  }, [app.system.streamState, app.system.view]);

  return (
    <Topbar theme={theme} app={app}>
      <Left>
        <Scroller>
          {/* First Content: System Info */}
          <ScrollerContent active={carplay}>
            <IconSmall isActive={true}>
              <use xlinkHref="/assets/svg/icons/thin/oil_temp.svg#oil_temp" />
            </IconSmall>
            <Caption1>73°C</Caption1>
          </ScrollerContent>

          {/* Second Content: Time */}
          <ScrollerContent active={!carplay}>
            <Caption1>{time.toLocaleTimeString('sv-SV', { hour: '2-digit', minute: '2-digit' })}</Caption1>
          </ScrollerContent>
        </Scroller>
      </Left>
      <Middle>
        <svg viewBox="0 0 350.8 48.95" xmlns="http://www.w3.org/2000/svg">
          <use xlinkHref="/assets/svg/typo.svg#volvo"></use>
        </svg>
      </Middle>
      <Right>
        <IconSmall isActive={false}>
          <use xlinkHref="/assets/svg/bluetooth.svg#bluetooth" />
        </IconSmall>
        <IconSmall isActive={app.system.phoneState}>
          <use xlinkHref="/assets/svg/phone.svg#phone" />
        </IconSmall>
        <IconSmall isActive={app.system.wifiState}>
          <use xlinkHref="/assets/svg/wifi.svg#wifi" />
        </IconSmall>
      </Right>
    </Topbar>
  );
};

export default TopBar;
