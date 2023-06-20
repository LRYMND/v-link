import { useState, useRef } from 'react';
import './swiper.scss';

import Dashboard from '../dashboard/Dashboard';
import Chartboard from '../chartboard/Chartboard';

function Swiper({ settings, boost, intake, coolant, voltage, lambda1, lambda2, timeStamps, valueArray }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const swipeContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  function swipeLeft() {
    //console.log('swiping left')
    if (currentPageIndex < 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  }

  function swipeRight() {
    //console.log('swiping right')
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  }

  function handleMouseDown(event) {
    //console.log('current page:', currentPageIndex);
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
            settings={settings}
            boost={boost}
            intake={intake}
            coolant={coolant}
            voltage={voltage}
            lambda1={lambda1}
            lambda2={lambda2}
          />
        </div>
        <div className="page2">
          <Chartboard
            settings={settings}
            boost={boost}
            intake={intake}
            coolant={coolant}
            voltage={voltage}
            lambda1={lambda1}
            lambda2={lambda2}
            timeStamps={timeStamps}
            valueArray={valueArray}
          />
        </div>
      </div>
    </div>
  );
}

export default Swiper;
