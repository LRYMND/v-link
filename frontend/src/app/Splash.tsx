import { useEffect, useState } from 'react';
import { APP } from '../store/Store';

const SplashScreen = () => {
  const [showSplash, setShowSplash] = useState(true);
  const app = APP((state) => state)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    showSplash && (
      <div className="splash-screen" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}>
        <div className="splash-content" style={{
          textAlign: 'center',
          color: 'white',
        }}>

          <svg xmlns="http://www.w3.org/2000/svg" width="20vh" height="20vh" style={{ fill: 'white' }}>
            <use xlinkHref="/assets/svg/moose.svg#moose"></use>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="40vh" height="10vh" style={{ fill: 'white' }}>
            <use xlinkHref="/assets/svg/vlink.svg#vlink"></use>
          </svg>
          <p>v {app.system.version}</p>



        </div>
      </div>
    )
  );
};

export default SplashScreen;