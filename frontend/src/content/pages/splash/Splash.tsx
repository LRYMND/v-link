import React, { useEffect, useState } from 'react';
import './splash.scss'; // You will need to create this CSS file for styling

const SplashScreen = ({ versionNumber }) => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash screen after 3 seconds
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    showSplash && (
      <div className="splash-screen">
        <div className="splash-content">
          <h1>RTVI</h1>
          <p>v {versionNumber}</p>
        </div>
      </div>
    )
  );
};

export default SplashScreen;