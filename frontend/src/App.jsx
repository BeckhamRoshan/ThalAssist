import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotModal from './components/ChatbotModal';
import Home from './pages/Home';
import DonorMatch from './pages/DonorMatch';
import Chatbot from './pages/Chatbot';
import BloodAvailability from './pages/BloodAvailability';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './components/AuthContext';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AuthProvider>
      <div className={`App ${darkMode ? 'dark' : ''}`}>
        <Router>
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/blood-availability" element={<BloodAvailability />} />
              <Route path="/donor-match" element={<DonorMatch />} />
              <Route path="/chatbot" element={<Chatbot />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>

            {/* Chatbot Modal can be used globally if needed */}
            <ChatbotModal />
          </main>
          <Footer />
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
