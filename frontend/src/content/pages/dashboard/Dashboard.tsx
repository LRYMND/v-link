import { useState, useEffect, useRef } from 'react';
import './dashboard.scss';

import Classic from './classic/Classic';
import Charts from './charts/Charts';
import Race from './race/Race';

import CarDataStore from '../../cardata/store/Datastore'

function Dashboard({ sensorSettings, applicationSettings, containerSize }) {

  const padding = 30 //pixels
  const components = [Classic, Race, Charts]; // Add more content as needed

  const totalPages = components.length; // Calculate the total number of pages
  const sliderWidth = totalPages * containerSize.width;

  const index = components.findIndex(component => component.name === applicationSettings.app.defaultDash.value);

  const [currentPageIndex, setCurrentPageIndex] = useState(index);
  const swipeContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [carData, setCarData] = useState({})

  useEffect(() => {
    const unsubscribe = CarDataStore.subscribe(
      (event) => {
        setCarData(event.carData)
        //console.log(carData)
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

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

  return (
    <div
      style={{
        position: "relative",
        width: `${containerSize.width - padding}px`,
        height: `${containerSize.height}px`,
        overflow: "hidden",
      }}

      className={`dashboard ${applicationSettings.app.colorTheme.value}`}
    >
      <div
        ref={swipeContainerRef}
        style={{
          display: "flex",
          flexDirection: "row",
          width: `${sliderWidth}px`,
          height: `${containerSize.height}px`,
          transform: `translateX(-${(currentPageIndex * (100 / totalPages))}%)`,
          transition: "transform 0.5s ease-in-out",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {components.map((Content, index) => (
          <div key={index} style={{ width: `${100 / totalPages}%` }}>
            <div style={{ width: `${containerSize.width - padding}px`, height: `${containerSize.height - padding}px`}}>
              <Content
                sensorSettings={sensorSettings}
                applicationSettings={applicationSettings}
                carData={carData}
                containerSize={containerSize}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
