import React from 'react';
import { motion } from 'framer-motion';
import { BsScissors, BsStopwatch, BsPeople, BsPhone, BsGraphUp, BsGear } from 'react-icons/bs';
import './Services.css';

const Services = () => {
  const services = [
    {
      icon: <BsScissors />,
      title: "Online Rezervacije",
      description: "Omogućite klijentima da rezervišu termine 24/7",
      delay: 0.1
    },
    {
      icon: <BsStopwatch />,
      title: "Upravljanje Terminima",
      description: "Efikasno organizujte radni kalendar",
      delay: 0.2
    },
    {
      icon: <BsPeople />,
      title: "Baza Klijenata",
      description: "Pratite istoriju poseta i preference",
      delay: 0.3
    },
    {
      icon: <BsPhone />,
      title: "Mobilna Aplikacija",
      description: "Upravljajte salonom sa bilo kog mesta",
      delay: 0.4
    },
    {
      icon: <BsGraphUp />,
      title: "Analitika",
      description: "Detaljni izveštaji i statistika",
      delay: 0.5
    },
    {
      icon: <BsGear />,
      title: "Prilagođavanje",
      description: "Sistem prilagođen vašim potrebama",
      delay: 0.6
    }
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="services-page">
      <motion.div 
        className="services-hero"
        {...fadeIn}
      >
        <h1>Naše Usluge</h1>
        <p>
          Otkrijte kako MojFrizer transformiše poslovanje frizerskih salona kroz 
          inovativna digitalna rešenja
        </p>
      </motion.div>

      <motion.div 
        className="services-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="stat-card">
          <h3>1000+</h3>
          <p>Aktivnih salona</p>
        </div>
        <div className="stat-card">
          <h3>50000+</h3>
          <p>Mesečnih rezervacija</p>
        </div>
        <div className="stat-card">
          <h3>98%</h3>
          <p>Zadovoljnih korisnika</p>
        </div>
      </motion.div>
      
      <div className="services-grid">
        {services.map((service, index) => (
          <motion.div 
            className="service-card"
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: service.delay }}
          >
            <div className="service-icon">
              {service.icon}
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Services; 