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

const MainContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  height: ${({ height }) => `${height}px`};
  width: ${({ width }) => `${width}px`};

  display: ${({ app }) => (app.system.view === 'Carplay' ? 'flex' : 'flex')};
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-start;

  box-sizing: border-box;
  padding-top: ${({ app }) => `${app.settings.side_bars.topBarHeight.value}px`};
  padding-left: ${({ app }) => `${app.settings.general.contentPadding.value}px`};
  padding-right: ${({ app }) => `${app.settings.general.contentPadding.value}px`};
  padding-bottom: ${({ app }) => `${app.settings.general.contentPadding.value}px`};
  background: none;
  //background: '${({ theme }) => `${theme.colors.gradients.gradient1}`}';
`;

const Static = styled.div`
  // Used to calculate contentsizes
  //display: flex;

  height: 100%;
  width: 100%;

  margin-left: 20px;
  margin-right: 20px;
  padding-bottom: 20px;
`

const Card = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  //align-items: stretch;
  justify-content: center;

  overflow: hidden;

  /* Apply the animation based on the current view */
  animation: ${({ theme, currentView, carPlay, minHeight, maxHeight, collapseLength }) => {

    if (currentView === 'Carplay' && carPlay) {
      return css`
        ${theme.animations.getVerticalCollapse(minHeight, maxHeight)} ${collapseLength}s ease-in-out forwards,
        fadeOut ${collapseLength}s ease-in-out forwards;
        padding: 0;
      `;
    } else {
      return css`
        ${theme.animations.getVerticalExpand(minHeight, maxHeight)} ${collapseLength}s ease-in-out forwards,
        fadeIn ${collapseLength}s ease-in-out forwards;
      `;
    }
  }};
  /* Avoid transition conflicts */
  transition: none;
  transform-origin: top;

  /* Add keyframes for fade effects */
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;


const Page = styled.div`
  position: relative;  
  flex: 1;

  display: flex;
  flex-direction: column;
  
  border-radius: 7px;
  background: ${({ theme }) => theme.colors.gradients.gradient1};

  overflow: hidden;
`;

const NavBlocker = styled.div`
  width: 100%;
  height: ${({ app, isActive }) =>
    isActive
      ? `${app.settings.side_bars.navBarHeight.value - app.settings.general.contentPadding.value}px`
      : '0'};

  animation: ${({ app, theme, isActive, collapseLength, minHeight, maxHeight }) => css`
    ${isActive
      ? theme.animations.getVerticalExpand(minHeight, maxHeight)
      : theme.animations.getVerticalCollapse(minHeight, maxHeight)} ${collapseLength}s ease-in-out forwards;
  `};

  background: none;
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

  const cardPadding = 20;

  /* CARPLAY TESTCODE */

  useEffect(() => {
    console.log(app.system.carplay)
    const user = app.system.carplay.user
    const phone = app.system.carplay.phone
    const stream = app.system.carplay.stream


    if (user && stream){
      console.log('carplay enabled')
      setCarPlay(true)}
    else
      setCarPlay(false)
  }, [app.system.carplay])




  /* CARPLAY TESTCODE */

  /* Get content size */
  const pageRef = useRef(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [contentSize, setContentSize] = useState(null);

  const [mounted, setMounted] = useState(false);

  // Calculate window size
  useEffect(() => {
    const handleResize = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100); // Adjust debounce delay as needed
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const calculateSize = () => {
      if (pageRef.current) {
        const rect = pageRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          app.update({
            system: {
              contentSize: { width: rect.width, height: rect.height },
            },
          });
          setMounted(true); // Mark the component as mounted
        } else {
          console.warn("Invalid container dimensions during animation:", rect);
        }
      }
    };

    // Trigger calculation after animations
    const animationTimeout = setTimeout(calculateSize, 500); // Adjust timeout based on your animation duration

    return () => clearTimeout(animationTimeout);
  }, [windowSize]);








  /* Fading Logic */
  const fadeLength = 200; //ms
  const collapseLength = 400; //ms
  const [fadeMain, setFadeMain] = useState('fade-in');
  const [fadePage, setFadePage] = useState('fade-in');
  const [currentView, setCurrentView] = useState(app.system.view);
  const [carPlay, setCarPlay] = useState(false);

  useEffect(() => {
    console.log(app.system.interface)

    app.update({system: { interface: { ...app.system.interface, content: false}}})
  }, [app.system.view, carPlay])




  useEffect(() => {
    if (app.system.view !== currentView) {
      setFadePage('fade-out'); // Trigger fade-out for the current view
      
      setTimeout(() => {
        setCurrentView(app.system.view); // Switch to the new view
        if (carPlay && app.system.view === 'Carplay') {
          setNavActive(false);
          app.update({system: { interface: { ...app.system.interface, content: false}}})
          return;
        } else {
          setFadePage('fade-in');
          app.update({system: { interface: { ...app.system.interface, content: true}}})
        }
      }, fadeLength); // Duration should match the CSS animation time
    }
  }, [app.system.view, carPlay]);











  /* NavBar Logic */
  const timerRef = useRef(null); // Store the timer ID
  const [navActive, setNavActive] = useState(true)
  const [isHovering, setIsHovering] = useState(false);

  const checkMouseY = (mouseY) => {
    const deadZone = 85; // Percentage
    if (mouseY > window.innerHeight * (deadZone / 100))
      return true;
    else
      return false;
  }

  useEffect(() => {
    console.log(navActive)
  }, [navActive])

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
    if (app.system.view != 'Settings')
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
          <NavBar isActive={navActive} isHovering={isHovering} />
          <MainContainer app={app} height={windowSize.height} width={windowSize.width} onClick={handleClick}>
            <SideBar collapseLength={collapseLength} />
            <Card
              theme={theme}
              currentView={currentView}
              carPlay={carPlay}
              maxHeight={windowSize.height - app.settings.side_bars.topBarHeight.value - cardPadding}
              minHeight={0}
              collapseLength={(collapseLength / 1000)}
              ref={pageRef}
            >
              <Page theme={theme}>

                <Fade className={fadePage} fadeLength={(fadeLength / 1000)}>

                  {mounted ? renderView() : <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                  }}> Not Mounted </div>}
                </Fade>
                <NavBlocker
                  app={app}
                  theme={theme}
                  isActive={navActive}
                  collapseLength={collapseLength / 1000}
                  minHeight={0}
                  maxHeight={app.settings.side_bars.navBarHeight.value - app.settings.general.contentPadding.value}
                />
              </Page>

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
