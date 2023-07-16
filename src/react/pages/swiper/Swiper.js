import { useState, useRef } from 'react';
import './swiper.scss';

import Dashboard from '../dashboard/Dashboard';
import Chartboard from '../chartboard/Chartboard';

function Swiper({ canbusSettings, userSettings, carData }) {

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const swipeContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);


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
    <div className="swipe-wrapper">
      <div
        ref={swipeContainerRef}
        className="swipe-container"
        style={{
          transform: `translateX(-${currentPageIndex * 100}%)`,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="page1">
          <Dashboard
            canbusSettings={canbusSettings}
            userSettings={userSettings}
            carData={carData}
          />
        </div>
        <div className="page2">
          <Chartboard
            canbusSettings={canbusSettings}
            userSettings={userSettings}
            carData={carData}
            length={100}
          />
        </div>
      </div>
    </div>
  );
}


export default Swiper;
