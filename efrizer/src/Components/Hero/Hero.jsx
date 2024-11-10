import React, { useState, useEffect } from 'react';
import './Hero.css';

function Hero() {
  const [animatedNumbers, setAnimatedNumbers] = useState({
    salons: 0,
    clients: 0,
    satisfaction: 0
  });

  useEffect(() => {
    const targetNumbers = {
      salons: 1000,
      clients: 50000,
      satisfaction: 98
    };

    const duration = 2000; // 2 sekunde za animaciju
    const steps = 60;
    const interval = duration / steps;

    const incrementNumbers = (progress) => {
      setAnimatedNumbers({
        salons: Math.round(progress * targetNumbers.salons),
        clients: Math.round(progress * targetNumbers.clients),
        satisfaction: Math.round(progress * targetNumbers.satisfaction)
      });
    };

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      if (currentStep >= steps) {
        clearInterval(timer);
        incrementNumbers(1); // Postavlja konačne vrednosti
      } else {
        // Koristi easing funkciju za glatkiju animaciju
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        incrementNumbers(easedProgress);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="App-hero">
      <div className="hero-content">
        <h1>MojFrizer</h1>
        <h2 className="subtitle">Digitalizujte Vaš Salon</h2>
        <p className="hero-text">
          Pojednostavite poslovanje vašeg salona uz našu aplikaciju. 
          Upravljajte rezervacijama i klijentima na jednom mestu.
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">
              {animatedNumbers.salons.toLocaleString()}+
            </span>
            <span className="stat-label">Aktivnih salona</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {animatedNumbers.clients.toLocaleString()}+
            </span>
            <span className="stat-label">Klijenata</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {animatedNumbers.satisfaction}%
            </span>
            <span className="stat-label">Zadovoljnih</span>
          </div>
        </div>
        <div className="hero-buttons">
          <button className="primary-btn">Započni Besplatno</button>
        </div>
      </div>
    </div>
  );
}

export default Hero; 