import React from 'react';
import './Cards.css';
import { BsCheckCircleFill, BsStarFill } from 'react-icons/bs';

const Cards = () => {
  return (
    <section className="pricing-section">
      <div className="pricing-container">
        <div className="pricing-card">
          <div className="card-content">
            <div className="card-header">
              <h3>Osnovni</h3>
              <p className="subtitle">Profil na MojFrizer.com</p>
              <div className="price-container">
                <div className="price">
                  <span className="currency">€</span>
                  <span className="amount">19</span>
                </div>
                <span className="period">/mesečno</span>
              </div>
            </div>
            
            <ul className="features-list">
              <li>
                <BsCheckCircleFill className="check-icon" />
                <span>Profil na MojFrizer platformi</span>
              </li>
              <li>
                <BsCheckCircleFill className="check-icon" />
                <span>Online sistem zakazivanja</span>
              </li>
              <li>
                <BsCheckCircleFill className="check-icon" />
                <span>Android aplikacija za praćenje</span>
              </li>
              <li>
                <BsCheckCircleFill className="check-icon" />
                <span>Email podrška</span>
              </li>
              <li>
                <BsCheckCircleFill className="check-icon" />
                <span>Osnovni izveštaji</span>
              </li>
            </ul>
            
            <button className="card-button">Započni Besplatno</button>
          </div>
        </div>

        <div className="pricing-card featured">
          <div className="popular-badge">
            <BsStarFill />
            <span>Najpopularnije</span>
          </div>
          <div className="card-content">
            <div className="card-header">
              <h3>Premium</h3>
              <p className="subtitle">Vaš personalni website</p>
              <div className="price-container">
                <div className="price">
                  <span className="currency">€</span>
                  <span className="amount">39</span>
                </div>
                <span className="period">/mesečno</span>
              </div>
            </div>

            <ul className="features-list">
              <li>
                <BsCheckCircleFill className="check-icon" />
                <span>Sve iz Osnovnog paketa</span>
              </li>
              <li>
                <BsCheckCircleFill className="check-icon" />
                <span>Vaš personalni website</span>
              </li>
              <li>
                <BsCheckCircleFill className="check-icon" />
                <span>SEO optimizacija</span>
              </li>
              <li>
                <BsCheckCircleFill className="check-icon" />
                <span>Napredna analitika</span>
              </li>
              <li>
                <BsCheckCircleFill className="check-icon" />
                <span>24/7 prioritetna podrška</span>
              </li>
            </ul>

            <button className="card-button featured-button">Izaberi Premium</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cards;
