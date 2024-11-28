import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BsCheckCircle, BsStarFill, BsShieldCheck } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';

const Pricing = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const pricingPlans = [
    {
      name: "Basic Plan",
      price: billingPeriod === 'monthly' ? '19' : '190',
      description: "Idealno za male salone",
      features: [
        "Online rezervacije 24/7",
        "Android aplikacija",
        "Email podrška",
        "Osnovni izveštaji",
        "Neograničene rezervacije"
      ]
    },
    {
      name: "Premium Plan",
      price: billingPeriod === 'monthly' ? '39' : '390',
      description: "Za salone koji žele više",
      isPopular: true,
      features: [
        "Sve iz Basic plana",
        "Personalizovan website",
        "SEO optimizacija",
        "Napredna analitika",
        "24/7 prioritetna podrška"
      ]
    }
  ];

  return (
    <div className="page-pricing">
      <motion.div 
        className="page-pricing-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Izaberite Plan</h1>
        <p>Fleksibilna rešenja za vaš salon</p>
      </motion.div>

      <motion.div 
        className="page-billing-toggle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button 
          className={billingPeriod === 'monthly' ? 'active' : ''}
          onClick={() => setBillingPeriod('monthly')}
        >
          Mesečno
        </button>
        <button 
          className={billingPeriod === 'yearly' ? 'active' : ''}
          onClick={() => setBillingPeriod('yearly')}
        >
          Godišnje
          <span className="page-save-badge">Ušteda 20%</span>
        </button>
      </motion.div>

      <div className="page-pricing-container">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.name}
            className={`page-price-card ${plan.isPopular ? 'popular' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            {plan.isPopular && (
              <div className="page-popular-tag">
                <BsStarFill /> Najpopularniji izbor
              </div>
            )}
            <h3>{plan.name}</h3>
            <p className="page-price-description">{plan.description}</p>
            <div className="page-price">
              <span className="page-currency">€</span>
              <span className="page-amount">{plan.price}</span>
              <span className="page-period">/{billingPeriod === 'monthly' ? 'mesečno' : 'godišnje'}</span>
            </div>
            <ul className="page-features">
              {plan.features.map((feature, i) => (
                <li key={i}>
                  <BsCheckCircle className="page-check-icon" />
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              className="page-select-plan"
              onClick={() => navigate('/register')}
            >
              Izaberi plan
            </button>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="page-pricing-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <BsShieldCheck /> Sigurno plaćanje sa 30-dnevnom garancijom povraćaja novca
      </motion.div>
    </div>
  );
};

export default Pricing;