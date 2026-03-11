import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import VideoPlayer from './pages/VideoPlayer';
import Auth from './pages/Auth';
import Channel from './pages/Channel';
import { authService } from './services/auth.service';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

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
              <Route path="/video/:id" element={<VideoPlayer />} />
              <Route path="/auth" element={<Auth setUser={setUser} />} />
              <Route path="/channel" element={<Channel user={user} />} />
              <Route path="/channel/:id" element={<Channel user={user} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;