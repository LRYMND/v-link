import { animations } from './Animations';

export const theme = {
  animations: animations,

  fonts: {
    spartan: "'League Spartan', sans-serif",
    inter: "'Inter 18pt', sans-serif",
  },
  
  icons: {
    small: '10px',
    medium: '16px',
    large: '32px',
    xlarge: '64px',
  },

  interaction: {
    toggleHeight: '20px',
    buttonHeight: '30px',
    buttonWidth: '200px',
  },

  colors: {    
    button: '#090909',
    navbar: '#090909',

    dark: '#202020',
    medium: '#404040',
    light: '#DBDBDB',

    text: '#DBDBDB',
    background: '#141414',
    navbar: '#090909',

    gradients: {
      gradient1: 'linear-gradient(180deg, #1C1C1C,#0D0D0D)',
      gradient2: 'linear-gradient(180deg, #0D0D0D, #1C1C1C)',
    },

    theme: {
      green: {
        default: '#3C729E',
        active: '#A7CEEE',
        navGlow: '0 0 20px rgba(165, 205, 237, 1)', // Define your glow here
      },
  
      blue: {
        default: '#3C729E',
        active: '#A7CEEE',
        navGlow: '0 0 20px rgba(165, 205, 237, 1)', // Define your glow here
      },
  
      red: {
        default: '#3C729E',
        active: '#A7CEEE',
        navGlow: '0 0 20px rgba(165, 205, 237, 1)', // Define your glow here
      },
  
      white: {
        default: '#3C729E',
        active: '#A7CEEE',
        navGlow: '0 0 20px rgba(165, 205, 237, 1)', // Define your glow here
      },
    },

  },

  fontWeights: {
    light: 300,
    regular: 400,
    semiBold: 600,
    bold: 700,
  },

  typography: {
    display4: {
      fontFamily: "'League Spartan', sans-serif",
      fontWeight: 700,
      fontSize: '64pt',
    },
    display3: {
      fontFamily: "'League Spartan', sans-serif",
      fontWeight: 700,
      fontSize: '32pt',
    },
    display2: {
      fontFamily: "'League Spartan', sans-serif",
      fontWeight: 700,
      fontSize: '20pt',
    },
    display1: {
      fontFamily: "'League Spartan', sans-serif",
      fontWeight: 400,
      fontSize: '17pt',
    },
    title: {
      fontFamily: "'Inter 18pt', sans-serif",
      fontWeight: 600,
      fontSize: '17pt',
    },
    subtitle: {
      fontFamily: "'Inter 18pt', sans-serif",
      fontWeight: 600,
      fontSize: '14pt',
    },
    body2: {
      fontFamily: "'League Spartan', sans-serif",
      fontWeight: 700,
      fontSize: '13pt',
    },
    body1: {
      fontFamily: "'League Spartan', sans-serif",
      fontWeight: 400,
      fontSize: '12pt',
    },
    caption2: {
      fontFamily: "'League Spartan', sans-serif",
      fontWeight: 400,
      fontSize: '12pt',
    },
    caption1: {
      fontFamily: "'League Spartan', sans-serif",
      fontWeight: 400,
      fontSize: '8pt',
    },
    button: {
      fontFamily: "'League Spartan', sans-serif",
      fontWeight: 700,
      fontSize: '13pt',
    },
  },
};