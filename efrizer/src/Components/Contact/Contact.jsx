import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BsEnvelope, BsPhone, BsGeoAlt, BsClock, BsCheckCircle, BsArrowRight } from 'react-icons/bs';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: <BsEnvelope />,
      title: "Email",
      info: "info@mojfrizer.com",
      delay: 0.1
    },
    {
      icon: <BsPhone />,
      title: "Telefon",
      info: "+381 11 123 456",
      delay: 0.2
    },
    {
      icon: <BsGeoAlt />,
      title: "Adresa",
      info: "Beograd, Srbija",
      delay: 0.3
    },
    {
      icon: <BsClock />,
      title: "Radno Vreme",
      info: "Pon - Pet: 9:00 - 17:00",
      delay: 0.4
    }
  ];

  return (
    <div className="contact-page">
      <motion.div 
        className="contact-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Kontaktirajte Nas</h1>
        <p>Tu smo da odgovorimo na sva vaša pitanja i pomognemo vam da unapredite vaše poslovanje</p>
      </motion.div>

      <motion.div 
        className="contact-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {contactInfo.map((item, index) => (
          <motion.div 
            key={index}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item.delay }}
          >
            <div className="stat-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.info}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="contact-container">
        <motion.div 
          className="contact-form-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Pošaljite nam poruku</h2>
          <p>Popunite formu ispod i javićemo vam se u najkraćem roku</p>
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Vaše ime"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Vaš email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="subject"
                placeholder="Naslov"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                name="message"
                placeholder="Vaša poruka"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
              ></textarea>
            </div>
            <button 
              type="submit" 
              className={`submit-btn ${isSubmitted ? 'submitted' : ''}`}
            >
              {isSubmitted ? (
                <>
                  <BsCheckCircle /> Poruka poslata
                </>
              ) : (
                <>
                  Pošalji Poruku <BsArrowRight />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact; 