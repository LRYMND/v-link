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
  justify-content: space-between;
  align-items: flex-end;
  //background: '${({ theme }) => `${theme.colors.gradients.gradient1}`}';
`;

const Card = styled.div`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;



  padding-top: 0px;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
  box-sizing: border-box;

  overflow: hidden;

  /* Apply the animation based on the current view */
  animation: ${({ theme, currentView, carPlay, minHeight, maxHeight, collapseLength }) => {

    if (currentView === 'Carplay' && carPlay) {
      return css`
        ${theme.animations.getVerticalCollapse(minHeight, maxHeight)} ${collapseLength}s ease-in-out forwards;
        padding: 0;
      `;
    } else {
      return css`
        ${theme.animations.getVerticalExpand(minHeight, maxHeight)} ${collapseLength}s ease-in-out forwards;
      `;
    }
  }};

  /* Avoid transition conflicts */
  transition: none;
`;

const Page = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  box-sizing: border-box;

  border-radius: 7px;
  background: ${({ theme }) => theme.colors.gradients.gradient1};

  overflow: hidden;
`;

const NavBlocker = styled.div`
  width: 100%;
  height: ${({ app, isActive }) =>
    isActive
      ? `${app.settings.side_bars.navBarHeight.value - app.settings.general.contentPadding.value}px`
      : '50px'};

  animation: ${({ app, theme, isActive, collapseLength, minHeight, maxHeight }) => css`
    ${isActive
      ? theme.animations.getVerticalExpand(minHeight, maxHeight)
      : theme.animations.getVerticalCollapse(minHeight, maxHeight)} ${collapseLength}s ease-in-out forwards;
  `};

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

  /* CARPLAY TESTCODE */
  const handleCarplay = () => {
    setTimeout(() => {
      setCarPlay(true)

      // Hide Elements when stream is revealead
      if (app.system.streamState && app.system.view === 'Carplay') {
        setNavActive(false);
        setFadeMain('fade-out');
      }
    }, 3000); // 3 seconds
  };

  useEffect(() => {
    if (app.system.streamState)
      handleCarplay()
  }, [app.system.streamState])

  /* CARPLAY TESTCODE */


  /* Fading Logic */
  const fadeLength = 200; //ms
  const collapseLength = 400; //ms
  const [fadeMain, setFadeMain] = useState('fade-in');
  const [fadePage, setFadePage] = useState('fade-in');
  const [currentView, setCurrentView] = useState(app.system.view);
  const [carPlay, setCarPlay] = useState(false);

  useEffect(() => {
    if (app.system.view !== currentView) {
      setFadePage('fade-out'); // Trigger fade-out for the current view

      setTimeout(() => {
        setCurrentView(app.system.view); // Switch to the new view
        if (carPlay && app.system.view === 'Carplay') { setNavActive(false); return; }
        else
          setFadePage('fade-in');
      }, fadeLength); // Duration should match the CSS animation time
    }
  }, [app.system.view, carPlay]);


  /* NavBar Logic */
  const timerRef = useRef(null); // Store the timer ID
  const [navActive, setNavActive] = useState(true)
  const [isHovering, setIsHovering] = useState(false);

  const checkMouseY = (mouseY) => {
    const deadZone = 85; // Percentage
    if(mouseY > window.innerHeight * (deadZone / 100))
      return true;
    else
      return false;
  }

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
    if(app.system.view != 'Settings')
      setNavActive(checkMouseY(event.clientY));
  };

  // Mouse position check to update isHovering state
  useEffect(() => {
    const handleMouseMove = (event) => {
      // Check if mouse is in the bottom third of the screen
      setIsHovering(checkMouseY(event.clientY))
    };

    // Attach the mouse move event
    window.addEventListener('mousemove', handleMouseMove);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    console.log('isHovering?', isHovering)
  }, [isHovering])

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

  useEffect(() => {
    console.log(navActive)
  }, [navActive])


  return (
    <>
      {app.system.startedUp ? (
        <>
          <TopBar app={app} />
          <NavBar isActive={navActive} isHovering={isHovering}/>
          <MainContainer app={app} onClick={handleClick}>
            <SideBar collapseLength={collapseLength} />
            <Card
              theme={theme}
              currentView={currentView}
              carPlay={carPlay}
              maxHeight={app.system.windowSize.height - app.settings.side_bars.topBarHeight.value}
              minHeight={0}
              collapseLength={(collapseLength / 1000)}
            >
              <Page theme={theme}>
                <Fade className={fadePage} fadeLength={(fadeLength / 1000)}>
                  {renderView()}
                </Fade>
              </Page>
              <NavBlocker
                app={app}
                theme={theme}
                isActive={navActive}
                collapseLength={collapseLength / 1000}
                minHeight={0}
                maxHeight={app.settings.side_bars.navBarHeight.value - app.settings.general.contentPadding.value}
              />
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
