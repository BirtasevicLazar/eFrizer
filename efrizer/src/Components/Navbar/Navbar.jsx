import React, { useState } from 'react';
import './Navbar.css';

function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="navbar">
      <div className="navbar-top">
        <div className="navbar-left">
          <a href="mailto:efrizer@kontakt.com" className="navbar-email">
            <span className="bi bi-envelope"></span><span> efrizer@kontakt.com</span>
          </a>
        </div>
        <div className="navbar-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <span className="bi bi-facebook"></span><span> Facebook</span>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <span className="bi bi-twitter"></span><span> Twitter</span>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <span className="bi bi-instagram"></span><span> Instagram</span>
          </a>
        </div>
      </div>

      <div className="navbar-divider"></div>

      <div className="navbar-bottom">
        <div className="navbar-bottom-left">
          <div className="navbar-logo">MojFrizer</div>
        </div>
        <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
          <a href="#home" onClick={toggleMenu}>Početna</a>
          <a href="#about" onClick={toggleMenu}>O nama</a>
          <a href="#services" onClick={toggleMenu}>Usluge</a>
          <a href="#contact" onClick={toggleMenu}>Kontakt</a>
        </div>
        <div className="hamburger" onClick={toggleMenu}>
          <span className={`hamburger-icon ${isMenuOpen ? 'open' : ''}`}>
            {isMenuOpen ? '✕' : '☰'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default NavigationBar;
