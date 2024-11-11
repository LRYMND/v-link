import { useState, useRef } from 'react';
import { APP } from '../../../store/Store';

import Classic from './classic/Classic';
import Race from './race/Race';
import Charts from './charts/Charts';

import Pagination from '../../components/Pagination';

import './dashboard.scss';
import '../../../styles.scss';
import '../../../themes.scss';

function Dashboard() {
  const app = APP((state) => state);


  // Component mapping by name
  const componentMap = {
    Classic: Classic,
    Race: Race,
    Charts: Charts,
  };

  const components = [Classic, Race, Charts]; // Array of component functions
  const totalPages = components.length; // Calculate the total number of pages
  const sliderWidth = totalPages * app.system.contentSize.width;
  const paginationSize = 15;

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

  function swipeLeft() {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
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
  }

  function handleMouseMove(event) {
    if (isDragging) {
      setCurrentX(event.clientX);
    }
  }

  function handleMouseUp() {
    if (isDragging) {
      setIsDragging(false);
      if (startX - currentX > 100) {
        swipeLeft();
      } else if (startX - currentX < -100) {
        swipeRight();
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

  return (
    <div className={`dashboard ${app.settings.general.colorTheme.value}`}
      style={{
        position: "relative",
        width: `${app.system.contentSize.width}px`,
        height: `${app.system.contentSize.height}px`,
      }}
    >
      <div
        ref={swipeContainerRef}
        style={{
          display: "flex",
          flexDirection: "row",
          width: `${sliderWidth}px`,
          height: `${app.system.contentSize.height - paginationSize}px`,
          transform: `translateX(-${(currentPageIndex * ((sliderWidth / totalPages)))}px)`,
          transition: "transform 0.5s ease-in-out",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {components.map((Component, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${(sliderWidth / totalPages)}px` }}>
            <div className='column' style={{ width: `${app.system.contentSize.width - (app.settings.general.dashboardPadding.value * 2)}px`, height: `${app.system.contentSize.height}px` }}>
              <Component />
            </div>
          </div>
        ))}
      </div>
      <div className='row'>
        <Pagination pages={components.length} colorActive='var(--themeDefault)' colorInactive='var(--boxColorDark)' currentPage={currentPageIndex} dotSize={paginationSize / 2} />
      </div>
    </div>
  );
}

export default Dashboard;
