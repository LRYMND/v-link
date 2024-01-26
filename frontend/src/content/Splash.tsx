import { useEffect, useState } from 'react';
import { Store } from './store/Store';

const SplashScreen = () => {
  const [showSplash, setShowSplash] = useState(true);
  const store = Store((state) => state);

  useEffect(() => {
    // Hide splash screen after 3 seconds
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

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
          <h1>RTVI</h1>
          <p>v {store.version}</p>
        </div>
      </div>
    )
  );
};

export default SplashScreen;