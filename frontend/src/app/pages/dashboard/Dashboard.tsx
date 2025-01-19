import { useState, useEffect, useRef } from 'react';
import { APP, KEY } from '../../../store/Store';
import styled, { useTheme } from 'styled-components';

import { Fade } from '../../../theme/styles/Effects';
import Classic from './classic/Classic';
import Race from './race/Race';
import Charts from './charts/Charts';
import Pagination from '../../components/Pagination';

const DashBoard = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const PageWrapper = styled.div`
  position: absolute;
  top: 0;
  left: ${({ direction }) => (direction === 'left' ? '-100%' : direction === 'right' ? '100%' : '0')};
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(${({ isActive }) => (isActive ? 1 : 0.8)});
  opacity: ${({ isActive }) => (isActive ? 1 : 0)};
  transition: transform 0.75s ease-in-out, opacity 0.75s ease-in-out, left 0.75s ease-in-out;
`;

const DRAG_THRESHOLD = 50;

function Dashboard() {
  const app = APP((state) => state);
  const key = KEY((state) => state);
  const theme = useTheme();
  const dashBoardRef = useRef(null);

  const components = [
    { name: "Classic", component: Classic },
    { name: "Race", component: Race },
    { name: "Charts", component: Charts },
  ];

  const defaultComponentIndex = components.findIndex(
    (item) => item.name === app.settings.general.defaultDash.value
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(defaultComponentIndex);

  const [transitioning, setTransitioning] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragEnd, setDragEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);


  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const resizeDebounceTimeout = useRef(null);

  // Efficiently handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (resizeDebounceTimeout.current) {
        clearTimeout(resizeDebounceTimeout.current);
      }
      resizeDebounceTimeout.current = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeDebounceTimeout.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (dashBoardRef.current) {
      const rect = dashBoardRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        console.log('dashboardRect: ', rect)
        app.update({
          system: {
            contentSize: { width: rect.width, height: rect.height },
          },
        });
      }
    }
  }, [windowSize]);

  const swipeLeft = () => {
    if (!transitioning) {
      setTransitioning(true);
      setCurrentPageIndex((prev) => (prev === components.length - 1 ? 0 : prev + 1));
      setTimeout(() => setTransitioning(false), 1000);
    }
  };

  const swipeRight = () => {
    if (!transitioning) {
      setTransitioning(true);
      setCurrentPageIndex((prev) => (prev === 0 ? components.length - 1 : prev - 1));
      setTimeout(() => setTransitioning(false), 1000);
    }
  };

  const handleDragStart = (startPos) => {
    setDragStart(startPos);
    setIsDragging(false);
  };

  const handleDragMove = (currentPos) => {
    if (!isDragging && Math.abs(currentPos - dragStart) > DRAG_THRESHOLD) {
      setIsDragging(true);
    }

    if (isDragging) {
      setDragEnd(currentPos);
    }
  };

  const handleDragEnd = () => {
    if (isDragging && Math.abs(dragEnd - dragStart) > DRAG_THRESHOLD) {
      dragEnd > dragStart ? swipeRight() : swipeLeft();
    }

    setIsDragging(false);
    setDragStart(0);
    setDragEnd(0);
  };

  const handleDoubleClick = (event) => {
    const clickX = event.clientX;
    const halfWindowWidth = window.innerWidth / 2;
    clickX < halfWindowWidth ? swipeRight() : swipeLeft();
  };

  useEffect(() => {
    if (key.keyStroke === app.settings.app_bindings.left.value) swipeRight();
    if (key.keyStroke === app.settings.app_bindings.right.value) swipeLeft();
  }, [key.keyStroke]);

  return (
    <DashBoard
      ref={dashBoardRef}
      className={app.settings.general.colorTheme.value}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseMove={(e) => handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
      onDoubleClick={handleDoubleClick}
    >
      <Wrapper>
        {components.map(({ component: Component }, index) => {
          const isActive = index === currentPageIndex;
          const direction = index < currentPageIndex ? 'left' : index > currentPageIndex ? 'right' : 'current';
          return (
            <PageWrapper key={index} isActive={isActive} direction={direction}>
              <Fade className={isActive ? 'fade-in' : 'fade-out'} fadeLength={0.75}>
                <Component />
              </Fade>
            </PageWrapper>
          );
        })}
      </Wrapper>
      <Pagination
        pages={components.length}
        colorActive={theme.colors.theme.blue.active}
        colorInactive={theme.colors.medium}
        currentPage={currentPageIndex}
        dotSize={7.5}
      />
    </DashBoard>
  );
}

export default Dashboard;
