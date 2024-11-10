import React, { useState } from 'react';
import './FAQ.css';
import { IoAdd, IoRemove } from 'react-icons/io5';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: "Kako mogu da počnem sa korišćenjem platforme?",
      answer: "Proces je jednostavan - registrujete se na platformi, unesete osnovne podatke o vašem salonu, postavite cenovnik i radno vreme. Nakon verifikacije, vaš profil postaje vidljiv klijentima i možete primati online rezervacije. Ceo proces traje manje od 15 minuta."
    },
    {
      question: "Šta dobijam sa Premium paketom?",
      answer: "Premium paket uključuje vaš personalizovani website sa integrisanim sistemom za zakazivanje, SEO optimizaciju, prilagođen dizajn prema vašem brendu, naprednu analitiku posećenosti i rezervacija, kao i prioritetnu 24/7 podršku. Takođe dobijate sve funkcionalnosti iz Osnovnog paketa."
    },
    {
      question: "Da li je Android aplikacija besplatna?",
      answer: "Da, Android aplikacija je potpuno besplatna i dostupna je u oba paketa. Preko nje možete pratiti sve rezervacije, upravljati terminima i dobijati instant obaveštenja o novim zakazivanjima."
    },
    {
      question: "Koliko dugo traje izrada personalnog website-a?",
      answer: "Izrada personalnog website-a traje 5-7 radnih dana. Proces počinje konsultacijama gde definišemo vaše potrebe i želje, nakon čega naš tim kreira dizajn i implementira sve potrebne funkcionalnosti."
    },
    {
      question: "Mogu li da otkažem pretplatu u bilo kom trenutku?",
      answer: "Da, pretplatu možete otkazati u bilo kom trenutku bez skrivenih troškova. Vaš nalog ostaje aktivan do kraja plaćenog perioda, nakon čega se automatski deaktivira."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <h2>Često Postavljana Pitanja</h2>
        
        <div className="faq-grid">
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleAccordion(index)}
            >
              <div className="question-header">
                <h3>{item.question}</h3>
                {activeIndex === index ? <IoRemove /> : <IoAdd />}
              </div>
              <div className="answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ; 