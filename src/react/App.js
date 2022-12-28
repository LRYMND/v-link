import { HashRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import React from 'react'

import NavBar from "./sidebars/NavBar";
import TopBar from "./sidebars/TopBar";

import Dashboard from "./pages/dashboard/Dashboard";
import Carplay from "./pages/carplay/Carplay";
import Settings from "./pages/settings/Settings";



const App = () => {

  const [showNav, setShowNav] = React.useState(true);
  

  return (
    <HashRouter>
      {
        showNav && <>
          <TopBar/>
          <NavBar/>
        </>
      }

      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Carplay showNavBar={setShowNav}/>} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  );
};

export default App;