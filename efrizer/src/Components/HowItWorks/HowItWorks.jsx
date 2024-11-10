import React from 'react';
import './HowItWorks.css';
import { BsPhone, BsGlobe, BsCalendarCheck, BsArrowRight } from 'react-icons/bs';

const HowItWorks = () => {
  const steps = [
    {
      icon: <BsPhone />,
      title: "Registrujte se",
      description: "Kreirajte nalog za vaš salon u nekoliko jednostavnih koraka"
    },
    {
      icon: <BsGlobe />,
      title: "Podesite profil",
      description: "Dodajte usluge, cene i radno vreme vašeg salona"
    },
    {
      icon: <BsCalendarCheck />,
      title: "Primajte rezervacije",
      description: "Klijenti mogu odmah početi sa online zakazivanjem"
    }
  ];

  return (
    <section className="how-it-works">
      <div className="container">
        <h2>Kako Funkcioniše</h2>
        <p className="subtitle">Započnite sa radom u 3 jednostavna koraka</p>
        
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-icon">
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {index < steps.length - 1 && (
                <BsArrowRight className="arrow-icon" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 