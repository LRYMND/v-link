import { useEffect, useState } from 'react';
import { Store } from '../store/Store';

import "./../styles.scss"
import "./../themes.scss"

const SplashScreen = () => {
  const [showSplash, setShowSplash] = useState(true);
  const store = Store((state) => state);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

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

          <div className='column'>
            <div className='row' style={{ justifyContent: 'center'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" style={{ fill: 'white' }}>
                <use xlinkHref="/assets/svg/moose.svg#moose"></use>
                </svg>
            </div>
            <h1>V-LINK</h1>
            <p>v {store.version}</p>
          </div>


        </div>
      </div>
    )
  );
};

export default SplashScreen;