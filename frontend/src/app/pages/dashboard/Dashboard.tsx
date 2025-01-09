import { useState, useEffect, useRef } from 'react';
import { APP, KEY } from '../../../store/Store';

import Classic from './classic/Classic';
import Race from './race/Race';
import Charts from './charts/Charts';

import Pagination from '../../components/Pagination';

import '../../../styles.scss';
import '../../../themes.scss';

function Dashboard() {
  const app = APP((state) => state);
  const key = KEY((state) => state);

  // Component mapping by name
  const componentMap = {
    Classic: Classic,
    Race: Race,
    Charts: Charts,
  };

  const components = [Classic, Race, Charts]; // Array of component functions
  const totalPages = components.length; // Calculate the total number of pages
  const sliderWidth = totalPages * (app.system.contentSize.width);
  const paginationSize = 15;
  const pageWidth = app.system.contentSize.width - (app.settings.general.contentPadding.value * 2);
  const pageHeight = app.system.contentSize.height - (app.settings.general.contentPadding.value) - paginationSize;

  // Find the index of the component based on the default dashboard value from settings
  const componentName = app.settings.general.defaultDash.value;
  const defaultComponentIndex = components.findIndex(
    (component) => componentMap[componentName] === component
  );

  const swipeContainerRef = useRef(null);

  const [currentPageIndex, setCurrentPageIndex] = useState(defaultComponentIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [movedDistance, setMovedDistance] = useState(0);

  const clickThreshold = 10; // Define how much the mouse must move (in pixels) to be considered a drag

  function swipeLeft() {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      console.log(app.settings.general.contentPadding.value)
    }
  }

  function swipeRight() {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  }

  function handleMouseDown(event) {
    setIsDragging(true);
    setStartX(event.clientX);
    setMovedDistance(0); // Reset the moved distance when mouse is pressed
  }

  function handleMouseMove(event) {
    if (isDragging) {
      const distanceMoved = event.clientX - startX;
      setMovedDistance(Math.abs(distanceMoved)); // Track the absolute distance moved
      setCurrentX(event.clientX);
    }
  }

  function handleMouseUp() {
    if (isDragging) {
      setIsDragging(false);
      if (movedDistance > clickThreshold) {
        // Only trigger swipe if the mouse moved beyond the threshold
        if (startX - currentX > 100) {
          swipeLeft();
        } else if (startX - currentX < -100) {
          swipeRight();
        }
      }
      setCurrentX(startX);
    }
  }

  function handleDoubleClick(event) {
    const clickX = event.clientX;
    const windowWidth = window.innerWidth;

    if (clickX < windowWidth / 2) {
      swipeRight();
    } else {
      swipeLeft();
    }
  }

  useEffect(() => {
    if (key.keyStroke == app.settings.app_bindings.left.value)
      swipeRight(); // Physically swiping to the right, shows the page to the left.
    if (key.keyStroke == app.settings.app_bindings.right.value)
      swipeLeft(); // Physically swiping to the left, shows the page to the right.
  }, [key.keyStroke]);

  return (
    <div className={`dashboard ${app.settings.general.colorTheme.value}`}
      style={{
        position: "relative",
        width: `${app.system.contentSize.width}px`,
        height: `${app.system.contentSize.height}px`,
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
      }}>
        <div
          ref={swipeContainerRef}
          style={{
            display: "flex",
            flexDirection: "row",
            width: `${sliderWidth}px`,
            height: `${pageHeight + (paginationSize / 2)}px`,
            transform: `translateX(-${(currentPageIndex * ((sliderWidth / totalPages)))}px)`,
            transition: "transform 0.75s ease-in-out",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          {components.map((Component, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'center',
              width: `${(app.system.contentSize.width)}px`,
            }}>
              <div style={{
                width: `${pageWidth}px`,
                height: `${pageHeight}px`,
                background: 'var(--boxGradient)',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Component />
              </div>
            </div>
          ))}
        </div>
        <div className='row'>
          <Pagination
            pages={components.length}
            colorActive='var(--themeDefault)'
            colorInactive='var(--boxColorDark)'
            currentPage={currentPageIndex}
            dotSize={paginationSize / 2}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
