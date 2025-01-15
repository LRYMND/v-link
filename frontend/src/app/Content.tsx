import { useState, useEffect, useRef } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { Fade } from '../theme/styles/Effects';

import { APP, KEY } from '../store/Store';

import Dashboard from './pages/dashboard/Dashboard';
import Carplay from './pages/carplay/Carplay';
import Settings from './pages/settings/Settings';
import NavBar from '../app/sidebars/NavBar';
import SideBar from '../app/sidebars/SideBar';
import TopBar from '../app/sidebars/TopBar';

import './../themes.scss';
import './../styles.scss';

const MainContainer = styled.div`
  height: ${({ app }) => `${app.system.windowSize.height - app.settings.side_bars.topBarHeight.value}px`};
  width: ${({ app }) => `${app.system.windowSize.width}px`};

  display: ${({ app }) => (app.system.view === 'Carplay' ? 'flex' : 'flex')};
  flex-direction: row;
  position: relative;
  justify-content: right;
  align-items: right;
  background: '${({ theme }) => `${theme.colors.gradients.gradient1}`}';
`;

const Card = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding-top: 5px;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
  box-sizing: border-box;

  transform-origin: right;

  /* Set the width based on current view */
  width: ${({ currentView, minWidth, maxWidth }) =>
    currentView != 'Settings'
      ? `${maxWidth}px` /* Use maxWidth when Settings is active */
      : `${minWidth}px`}; /* Default to minWidth when other views are active */

  /* Apply the animation based on the current view */
  animation: ${({ theme, currentView, minWidth, maxWidth, fadeLength }) => {
    if (currentView === 'Settings') {
      return css`
        ${theme.animations.getHorizontalCollapse(minWidth, maxWidth)} ${fadeLength}s ease-in-out forwards;
      `;
    } else {
      return css`
        ${theme.animations.getHorizontalExpand(minWidth, maxWidth)} ${fadeLength}s ease-in-out forwards;
      `;
    }
  }};

  /* Avoid transition conflicts */
  transition: none;
`;

const View = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 20px;
  box-sizing: border-box;

  border-radius: 7px;
  background: ${({ theme }) => theme.colors.gradients.gradient1};
`;

const NavBlocker = styled.div`
  width: 100%;
  align-self: center;
  animation: ${({ app, theme, isActive }) => css`
    ${isActive
      ? theme.animations.getVerticalExpand(
        app.settings.side_bars.navBarHeight.value -
        app.settings.general.contentPadding.value
      )
      : theme.animations.getVerticalCollapse(
        app.settings.side_bars.navBarHeight.value -
        app.settings.general.contentPadding.value
      )} 0.3s ease-in-out forwards;
  `};
  height: ${({ app, isActive }) =>
    isActive
      ? `${app.settings.side_bars.navBarHeight.value - app.settings.general.contentPadding.value}px`
      : '50px'};
  transition: height 0.3s ease-in-out;
`;



const Content = () => {
  const viewMap = {
    Dashboard: Dashboard,
    Carplay: Carplay,
    Settings: Settings,
  };

  const app = APP((state) => state);
  const key = KEY((state) => state);

  const theme = useTheme();


  /* Fading Logic */
  const fadeLength = 300; //ms
  const [fadeMain, setFadeMain] = useState('fade-in');
  const [currentView, setCurrentView] = useState(app.system.view);

  useEffect(() => {
    if (app.system.view !== currentView) {
      setFadeMain('fade-out'); // Trigger fade-out for the current view

      setTimeout(() => {
        setCurrentView(app.system.view); // Switch to the new view
        setFadeMain('fade-in'); // Trigger fade-in for the new view
      }, fadeLength); // Duration should match the CSS animation time
    }
  }, [app.system.view]);


  /* NavBar Logic */
  const timerRef = useRef(null); // Store the timer ID
  const [navActive, setNavActive] = useState(true)

  useEffect(() => {
    console.log('view', navActive)
    if (app.system.view === 'Settings') {
      setNavActive(true);
      clearTimeout(timerRef.current); // Clear the timeout immediately if in Settings
      return;
    }

    // Start a timer to hide the nav bar after 3 seconds when not in 'Settings'
    if (navActive) {
      timerRef.current = setTimeout(() => setNavActive(false), 3000);
    }

    return () => clearTimeout(timerRef.current); // Clear timeout on cleanup
  }, [app.system.view, navActive]);

  const handleClick = (event) => {
    // Trigger the nav bar to show when clicking lower part of the screen
    if (event.clientY > window.innerHeight * 2 / 3) {
      setNavActive(true);
    }
  };

  useEffect (() => {
    console.log(navActive)
  }, navActive)

  /* Render Pages */
  const renderView = () => {
    const Component = viewMap[currentView];
    if (!Component) {
      console.error(`Component for view "${currentView}" is undefined.`);
      return null;
    }
    return <Component />;
  };

  useEffect(() => {
    app.update({ system: { switch: app.settings.app_bindings.switch.value } });
  }, [app.settings.app_bindings.switch]);


  /* Navigation with Keypress */
  const cycleView = () => {
    const viewKeys = Object.keys(viewMap);
    let currentIndex = viewKeys.indexOf(app.system.view);

    if (currentIndex === viewKeys.length - 1) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }

    app.update({ system: { view: viewKeys[currentIndex] } });
  };

  useEffect(() => {
    if (key.keyStroke === app.system.switch) cycleView();
  }, [key.keyStroke]);


  return (
    <>
      {app.system.startedUp ? (
        <>
          <TopBar app={app} />
          <NavBar isActive={navActive} />

          <MainContainer app={app} onClick={handleClick}>
            <SideBar />

            <Card
              theme={theme}
              currentView={currentView}
              minWidth={app.system.windowSize.width - app.settings.side_bars.sideBarWidth.value}
              maxWidth={app.system.windowSize.width}
              fadeLength={(fadeLength / 1000)}
            >
              <View theme={theme}>
                <Fade className={fadeMain} fadeLength={fadeLength}>
                  {renderView()}
                </Fade>
                <NavBlocker app={app} theme={theme} isActive={navActive} />
              </View>
            </Card>
          </MainContainer>

        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Content;
