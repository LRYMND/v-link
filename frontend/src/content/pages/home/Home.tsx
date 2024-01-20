import {
  useEffect,
  useState,
} from 'react'

import Dashboard from '../dashboard/Dashboard';
import Settings from '../settings/Settings';
//import Volvo from '../volvo/Volvo';

import "./../../../themes.scss"
import './home.scss';


const Home = ({
  applicationSettings,
  sensorSettings,
  view,
  versionNumber,
  canState,
  adcState
}) => {
  // Application state variables
  const [startedUp, setStartedUp] = useState(false);

  // Container state variables
  const [containerSize, setContainerSize] = useState({
    height: 0,
    width: 0
  });

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  function updateContainer() {
    if (view === 'carplay') {
      setContainerSize(prevSize => ({
        ...prevSize,
        height: windowSize.height - applicationSettings.app.dashBarHeight.value,
        width: windowSize.width
      }));
    } else {
      setContainerSize(prevSize => ({
        ...prevSize,
        height: windowSize.height - applicationSettings.app.navBarHeight.value - applicationSettings.app.topBarHeight.value,
        width: windowSize.width
      }));
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener to window resize
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    updateContainer();
    if (!startedUp) {
      setStartedUp(true);
      console.log("Settings loaded.")
    }
  }, [startedUp])

  useEffect(() => {
    updateContainer();
  }, [windowSize])


  const renderView = () => {
    switch (view) {
      case 'Carplay':
        return (
          <>
          </>
        )

      case 'Dashboard':
        return (
          <Dashboard
            containerSize={containerSize}
            sensorSettings={sensorSettings}
            applicationSettings={applicationSettings}
          />
        )

      case 'Settings':
        return (
          <Settings
            canState={canState}
            adcState={adcState}
            sensorSettings={sensorSettings}
            applicationSettings={applicationSettings}
            versionNumber={versionNumber}
          />
        )

      case 'Volvo':
        return (
          {/* 
          <Volvo
            sensorSettings={sensorSettings}
            applicationSettings={applicationSettings}
          />
          */}
        )

      default:
        return (
          <Dashboard
            containerSize={containerSize}
            sensorSettings={sensorSettings}
            applicationSettings={applicationSettings}
          />
        )

    }
  }

  return (
    <>
      {startedUp ? (
        <div className='content' style={{
          height: `${containerSize.height}px`,
          width: `${containerSize.width}px`,
          marginTop: `${(view === "carplay" && applicationSettings.app.activateDashbar.value ? applicationSettings.app.dashBarHeight.value : applicationSettings.app.topBarHeight.value)}px `
        }}>

          {renderView()}

        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default Home;
