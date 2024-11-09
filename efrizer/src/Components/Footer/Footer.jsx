import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-logo">MojFrizer</div>
        <div className="footer-links">
          <ul>
            <li><a href="#services">Usluge</a></li>
            <li><a href="#about">O nama</a></li>
            <li><a href="#contact">Kontakt</a></li>
          </ul>
          <ul>
            <li><a href="#privacy">Politika privatnosti</a></li>
            <li><a href="#terms">Uslovi korišćenja</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2023 eFrizer. Sva prava zadržana.</p>
        <div className="footer-social-links">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
