import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import DonorMatch from './pages/DonorMatch';
import Chatbot from './pages/Chatbot';
import BloodAvailability from './pages/BloodAvailability';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      <Router>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blood-availability" element={<BloodAvailability />} />
            <Route path="/donor-match" element={<DonorMatch />} />
            <Route path="/chatbot" element={<Chatbot />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;