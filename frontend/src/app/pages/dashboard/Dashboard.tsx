import { useState, useEffect, useRef } from 'react';
import { APP, KEY } from '../../../store/Store';
import styled, { useTheme } from 'styled-components';
import { Fade } from '../../../theme/styles/Effects';
import Classic from './classic/Classic';
import Race from './race/Race';
import Charts from './charts/Charts';
import Pagination from '../../components/Pagination';
import '../../../styles.scss';
import '../../../themes.scss';

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

const DRAG_THRESHOLD = 50; // Minimum drag distance to trigger page change

function Dashboard() {
  const app = APP((state) => state);
  const key = KEY((state) => state);
  const theme = useTheme();
  const dashBoardRef = useRef(null);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragEnd, setDragEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const components = [Classic, Race, Charts];

  const swipeLeft = () => {
    if (!transitioning) {
      setTransitioning(true);
      setCurrentPageIndex((prev) => (prev === components.length - 1 ? 0 : prev + 1)); // Loop to first page
      setTimeout(() => setTransitioning(false), 750); // Match animation duration
    }
  };

  const swipeRight = () => {
    if (!transitioning) {
      setTransitioning(true);
      setCurrentPageIndex((prev) => (prev === 0 ? components.length - 1 : prev - 1)); // Loop to last page
      setTimeout(() => setTransitioning(false), 750); // Match animation duration
    }
  };

  // Common drag handler logic for mouse and touch events
  const handleDragStart = (startPos) => {
    setDragStart(startPos);
    setIsDragging(false); // Initially, we're not dragging
  };

  const handleDragMove = (currentPos) => {
    if (!isDragging) {
      const moveDistance = Math.abs(currentPos - dragStart);
      if (moveDistance > DRAG_THRESHOLD) {
        setIsDragging(true); // Start dragging after exceeding threshold
      }
    }

    if (isDragging) {
      setDragEnd(currentPos); // Update drag position while dragging
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return; // Ignore if not dragging

    const dragDistance = dragEnd - dragStart;
    if (Math.abs(dragDistance) > DRAG_THRESHOLD) {
      dragDistance > 0 ? swipeRight() : swipeLeft(); // Swiped right or left
    }

    // Reset dragging state
    setIsDragging(false);
    setDragStart(0);
    setDragEnd(0);
  };

  const handleDoubleClick = (event) => {
    const clickX = event.clientX;
    const halfWindowWidth = window.innerWidth / 2;
    clickX < halfWindowWidth ? swipeRight() : swipeLeft(); // Switch pages based on side of screen clicked
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
        {components.map((Component, index) => {
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
        colorActive='var(--themeDefault)'
        colorInactive='var(--boxColorDark)'
        currentPage={currentPageIndex}
        dotSize={7.5}
      />
    </DashBoard>
  );
}

export default Dashboard;
