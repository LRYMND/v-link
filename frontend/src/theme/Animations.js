import { keyframes } from 'styled-components';

const getSlideDown = (height) => keyframes`
  0% {
    transform: translateY(${height}px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const getSlideUp = (height) => keyframes`
  0% {
    transform: translateY(0px);
  }
  100% {
    transform: translateY(${height}px);
  }
`;

const getSlideLeft = (height) => keyframes`
  0% {
    transform: translateX(${height}px);
  }
  100% {
    transform: translateX(0px);
  }
`;

const getSlideRight = (height) => keyframes`
  0% {
    transform: translateX(0px);
  }
  100% {
    transform: translateX(${height}px);
  }
`;

const getVerticalExpand = (height) => keyframes`
  0% {
    height: 0px; /* Hidden */
  }
  100% {
    height: ${height}px; /* Fully visible */
  }
`;

const getVerticalCollapse = (height) => keyframes`
  0% {
    height: ${height}px; /* Fully visible */
  }
  100% {
    height: 0px; /* Hidden */
  }
`;

const getHorizontalExpand = (minWidth, maxWidth) => keyframes`
  0% {
    width: ${minWidth}px; /* Starting at the collapsed width */
  }
  100% {
    width: ${maxWidth}px; /* Expanding to the full width */
  }
`;

const getHorizontalCollapse = (minWidth, maxWidth) => keyframes`
  0% {
    width: ${maxWidth}px; /* Starting at the full width */
  }
  100% {
    width: ${minWidth}px; /* Collapsing to the hidden width */
  }
`;

export const animations = {
      getSlideDown,
      getSlideUp,
      getSlideLeft,
      getSlideRight,
      getVerticalExpand,
      getVerticalCollapse,
      getHorizontalExpand,
      getHorizontalCollapse
  };