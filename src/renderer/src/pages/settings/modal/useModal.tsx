import { useState } from 'react';

const useModal = () => {
  const [isShowing, setIsShowing] = useState(false);
  const [carplayModalIsShowing, carplayModalSetIsShowing] = useState(false);
  const [wifiModalIsShowing, wifiModalSetIsShowing] = useState(false);

  function toggle() {
    setIsShowing(!isShowing);
  }

  function carplayModalToggle() {
    carplayModalSetIsShowing(!carplayModalIsShowing);
  }

  function wifiModalToggle() {
    wifiModalSetIsShowing(!wifiModalIsShowing);
  }

  return {
    isShowing,
    carplayModalIsShowing,
    wifiModalIsShowing,
    toggle,
    carplayModalToggle,
    wifiModalToggle
  }
};

export default useModal;
