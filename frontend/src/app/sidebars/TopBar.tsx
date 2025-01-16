import { useState, useEffect } from "react";
import { APP } from '../../store/Store';
import styled, { useTheme } from 'styled-components';

import { IconSmall } from '../../theme/styles/Icons';
import { Caption1 } from '../../theme/styles/Typography';

const Topbar = styled.div`
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.gradients.gradient1};
  height: ${({ app }) => `${app.settings.side_bars.topBarHeight.value}px`};
  width: 100%;
  display: flex;
  z-index: 1;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 20px;
  padding-right: 20px;
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: hidden;
  transition: height 0.3s ease-in-out;
`;

const ScrollerContent = styled.div`
  width: 100%;
  height: ${({ height }) => height}; 
  transition: height 0.3s ease-in-out;
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
`;

const TopBar = () => {
  const app = APP((state) => state);
  const theme = useTheme();

  const [time, setDate] = useState(new Date());

  function updateTime() {
    setDate(new Date());
  }

  useEffect(() => {
    const timer1 = setInterval(updateTime, 10000);

    return function cleanup() {
      clearInterval(timer1);
    };
  }, []);

  // Conditionally determine which content to show

  const [carplay, setCarplay] = useState(true)
  useEffect (() => {
    if(app.system.streamState && app.system.view === 'Carplay')
      setCarplay(true)
    else
      setCarplay(false)
  })

  return (
    <Topbar theme={theme} app={app}>
      <Left>
        <Scroller>
          {/* First Content: Time */}
          <ScrollerContent height={carplay ? app.settings.side_bars.topBarHeight.value : 0}>
          <Caption1>Important System Information</Caption1>
          </ScrollerContent>

          {/* Second Content: System Info */}
          <ScrollerContent height={carplay ? 0 : app.settings.side_bars.topBarHeight.value}>
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
