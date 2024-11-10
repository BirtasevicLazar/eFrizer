import React from 'react';
import './Cards.css';

const Cards = () => {
  return (
    <div className="pricing-container">
      <div className="pricing-card basic">
        <div className="card-header">
          <h3>Osnovni Paket</h3>
          <div className="price">
            <span className="currency">€</span>
            <span className="amount">19</span>
            <span className="period">/mes</span>
          </div>
        </div>
        
        <div className="card-features">
          <ul>
            <li>✓ Online zakazivanje</li>
            <li>✓ Email podrška</li>
            <li>✓ Osnovni izveštaji</li>
            <li>✓ 1 zaposleni</li>
          </ul>
        </div>

        <button className="card-btn">Izaberi Plan</button>
      </div>

      <div className="pricing-card premium">
        <div className="popular-badge">Najpopularnije</div>
        <div className="card-header">
          <h3>Premium Paket</h3>
          <div className="price">
            <span className="currency">€</span>
            <span className="amount">39</span>
            <span className="period">/mes</span>
          </div>
        </div>

        <div className="card-features">
          <ul>
            <li>✓ Sve iz Osnovnog paketa</li>
            <li>✓ 24/7 podrška</li>
            <li>✓ Napredna analitika</li>
            <li>✓ Neograničen broj zaposlenih</li>
            <li>✓ Prilagođeni izveštaji</li>
          </ul>
        </div>

        <button className="card-btn premium-btn">Izaberi Plan</button>
      </div>
    </div>
  );
};

export default Cards;
