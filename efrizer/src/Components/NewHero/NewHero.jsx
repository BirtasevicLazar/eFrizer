import React from 'react';
import { motion } from 'framer-motion';
import { BsScissors, BsArrowRight, BsCalendarCheck, BsShieldCheck } from 'react-icons/bs';
import './NewHero.css';
import { useNavigate } from 'react-router-dom';

const NewHero = () => {
  const navigate = useNavigate();

  return (
    <div className="new-hero">
      <div className="hero-overlay"></div>
      
      <div className="hero-content">
        <motion.div 
          className="hero-text-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>
            Digitalizujte Vaš
            <span className="gradient-text"> Frizerski Salon</span>
            <BsScissors className="scissors-icon" />
          </h1>
          
          <p>Pojednostavite poslovanje i povećajte broj klijenata uz našu naprednu platformu za online rezervacije</p>
          
          <div className="hero-features">
            <div className="feature">
              <BsCalendarCheck />
              <span>Online Rezervacije 24/7</span>
            </div>
            <div className="feature">
              <BsShieldCheck />
              <span>Sigurno i Pouzdano</span>
            </div>
          </div>

          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button 
              className="primary-button"
              onClick={() => navigate('/pricing')}
            >
              Pogledaj Cenovnik
              <BsArrowRight />
            </button>
            
            <button 
              className="secondary-button"
              onClick={() => navigate('/services')}
            >
              Naše Usluge
            </button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="hero-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="image-container">
            <div className="gradient-circle"></div>
            <div className="floating-elements">
              <div className="floating-icon calendar">
                <BsCalendarCheck />
              </div>
              <div className="floating-icon scissors">
                <BsScissors />
              </div>
              <div className="floating-icon shield">
                <BsShieldCheck />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NewHero; 