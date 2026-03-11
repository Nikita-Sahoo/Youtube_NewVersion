import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Auth from './pages/Auth';


function App() {

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header toggleSidebar={toggleSidebar} user={user} setUser={setUser} />
        <div className="flex pt-14">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth setUser={setUser} />} />
         
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;