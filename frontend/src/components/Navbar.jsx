import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar({ darkMode, toggleDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className={`navbar ${darkMode ? 'dark' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-text">ThalAssist+</span>
        </Link>
        
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/blood-availability" 
            className={`nav-link ${isActive('/blood-availability')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Blood Banks
          </Link>
          <Link 
            to="/donor-match" 
            className={`nav-link ${isActive('/donor-match')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Find Donors
          </Link>
          <Link 
            to="/chatbot" 
            className={`nav-link ${isActive('/chatbot')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            AI Assistant
          </Link>
        </div>

        <div className="nav-controls">
          <button 
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          <div 
            className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;