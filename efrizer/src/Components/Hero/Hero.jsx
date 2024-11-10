import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <div className="App-hero">
      <header className="App-header">
        <div className="hero-content">
          <h1>MojFrizer</h1>
          <h2 className="subtitle">Digitalizujte Vaš Salon</h2>
          <p className="hero-text">
            Pojednostavite poslovanje vašeg salona uz našu aplikaciju. Upravljajte rezervacijama 
            i klijentima na jednom mestu.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Aktivnih salona</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50k+</span>
              <span className="stat-label">Klijenata</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Zadovoljnih</span>
            </div>
          </div>
          <div className="hero-buttons">
            <button className="primary-btn">Započni Besplatno</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Hero; 