import { useState, useEffect, useRef } from 'react';
import './dashboard.scss';

import Gauges from './gauges/Gauges';
import Charts from './charts/Charts';

import CarDataStore from '../../cardata/store/Datastore'

const totalPages = 2; // Adjust the number of pages accordingly
const containerWidth = 100 * totalPages; // Set the total width of all pages


function Dashboard({ canbusSettings, applicationSettings }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const swipeContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const totalPages = 2; // Adjust the number of pages accordingly
  const containerWidth = 100 * totalPages; // Set the total width of all pages

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
    if (currentPageIndex < 1) {
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
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        ref={swipeContainerRef}
        style={{
          display: "flex",
          flexDirection: "row",
          width: `${containerWidth}%`,
          height: "100%",
          transform: `translateX(-${(currentPageIndex * (100 / totalPages))}%)`,
          transition: "transform 0.5s ease-in-out",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            width: `${100 / totalPages}%`,
          }}
        >
          <Gauges
            canbusSettings={canbusSettings}
            applicationSettings={applicationSettings}
            carData={carData}
          />
        </div>
        <div
          style={{
            width: `${100 / totalPages}%`,
          }}
        >
          <Charts
            canbusSettings={canbusSettings}
            applicationSettings={applicationSettings}
            carData={carData}
            length={100}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
