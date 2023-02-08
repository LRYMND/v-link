import React from 'react';
import { CarplayAudio } from 'react-js-carplay'

import Home from './pages/home/Home';

import './App.css';


const App = () => {

  return (
    <div className='container'>
      <CarplayAudio />
      <Home />
    </div>
  );
};

export default App;
