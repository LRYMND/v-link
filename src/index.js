import React from 'react';
//import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './react/App';
import reportWebVitals from './reportWebVitals';

//Setup StrictMode:
function RenderApp(props) {
  const condition = props;

  if (condition === true) {
    return (
    <React.StrictMode>
        <App />
    </React.StrictMode>
    );
  } else {
    return (
        <App />
    );
  }
}

//ReactDOM.render(
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <RenderApp StrictMode={true} />
  //<React.StrictMode>
  //  <App />
  //</React.StrictMode>,
  //document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
