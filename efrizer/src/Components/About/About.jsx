import React from 'react';
import { motion } from 'framer-motion';
import { BsPeople, BsAward, BsClock, BsShield, BsBuilding, BsGraphUp } from 'react-icons/bs';
import './About.css';

const About = () => {
  const stats = [
    { number: "1000+", label: "Aktivnih salona", icon: <BsBuilding /> },
    { number: "50000+", label: "Rezervacija mesečno", icon: <BsGraphUp /> },
    { number: "98%", label: "Zadovoljnih klijenata", icon: <BsPeople /> },
    { number: "24/7", label: "Podrška", icon: <BsClock /> }
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="about-page">
      <motion.div className="about-hero" {...fadeIn}>
        <h1>Transformišemo frizersku industriju</h1>
        <p>
          Spajamo tradicionalno frizersko umeće sa modernom tehnologijom, 
          stvarajući budućnost lepote i nege kose.
        </p>
      </motion.div>

      <motion.div 
        className="stats-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            className="stat-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <h3>{stat.number}</h3>
            <p>{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="about-sections">
        <motion.div 
          className="about-section"
          {...fadeIn}
          transition={{ delay: 0.4 }}
        >
          <h2>Naša Vizija</h2>
          <p>
            Želimo da budemo vodeća platforma koja povezuje salone i klijente, 
            stvarajući jednostavno i efikasno iskustvo za sve. Verujemo u moć 
            tehnologije da transformiše tradicionalne načine poslovanja.
          </p>
        </motion.div>

        <motion.div 
          className="about-section"
          {...fadeIn}
          transition={{ delay: 0.5 }}
        >
          <h2>Naše Vrednosti</h2>
          <p>
            Inovacija, pouzdanost i fokus na korisnika su u srži svega što radimo. 
            Posvećeni smo stvaranju rešenja koja donose stvarnu vrednost našim 
            korisnicima i njihovim klijentima.
          </p>
        </motion.div>
      </div>

      <motion.div 
        className="mission-section"
        {...fadeIn}
        transition={{ delay: 0.6 }}
      >
        <h2>Naša Misija</h2>
        <p>
          Stvaramo most između modernih tehnologija i tradicionalnog frizerskog zanata, 
          omogućavajući salonima da pruže vrhunsko iskustvo svojim klijentima.
        </p>
        
        <div className="features-grid">
          <div className="feature-card">
            <BsPeople className="feature-icon" />
            <h3>Korisnički Fokus</h3>
            <p>Razvijamo rešenja koja odgovaraju stvarnim potrebama</p>
          </div>
          
          <div className="feature-card">
            <BsAward className="feature-icon" />
            <h3>Kvalitet</h3>
            <p>Garantujemo najviši nivo usluge i podrške</p>
          </div>
          
          <div className="feature-card">
            <BsClock className="feature-icon" />
            <h3>Dostupnost</h3>
            <p>Naša platforma je dostupna 24/7</p>
          </div>
          
          <div className="feature-card">
            <BsShield className="feature-icon" />
            <h3>Sigurnost</h3>
            <p>Vaši podaci su maksimalno zaštićeni</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About; 