import React from 'react';
import './Navbar.css';

function NavigationBar() {
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
          <div className="navbar-logo">eFrizer</div>
        </div>
        <div className="navbar-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </div>
  );
}

export default NavigationBar;
