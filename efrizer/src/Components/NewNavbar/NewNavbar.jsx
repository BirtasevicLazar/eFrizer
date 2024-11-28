import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BsScissors, BsSearch, BsPerson, BsX, BsHouseDoor, BsCash, BsInfoCircle, BsEnvelope, BsGeoAlt, BsTelephone, BsArrowRight } from 'react-icons/bs';
import './NewNavbar.css';

const NewNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    if (searchValue.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://192.168.0.31:8888/efrizer/php_api/search_salons.php?query=${encodeURIComponent(searchValue)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Greška pri pretraživanju:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
    setSearchResults([]);
    navigate('/');
  };

  const menuVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "tween",
        duration: 0.2
      }
    },
    open: {
      x: 0,
      transition: {
        type: "tween",
        duration: 0.2
      }
    }
  };

  return (
    <nav className={`new-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <BsScissors className="logo-icon" />
          <span>MojFrizer</span>
        </Link>

        <div className="navbar-center">
          <ul className="nav-links desktop-links">
            <li><Link to="/">Početna</Link></li>
            <li><Link to="/services">Usluge</Link></li>
            <li><Link to="/pricing">Cenovnik</Link></li>
            <li><Link to="/about">O nama</Link></li>
            <li><Link to="/contact">Kontakt</Link></li>
          </ul>
        </div>

        <div className="navbar-right">
          <button 
            className="nav-icon-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <BsSearch />
          </button>
          
          {!localStorage.getItem('isAuthenticated') ? (
            <div className="auth-buttons">
              <button 
                className="login-btn"
                onClick={() => navigate('/login')}
              >
                Prijava
              </button>
              <button 
                className="register-btn"
                onClick={() => navigate('/register')}
              >
                Registracija
              </button>
            </div>
          ) : (
            <button 
              className="dashboard-btn"
              onClick={() => navigate('/login')}
            >
              <BsPerson />
              Kontrolna tabla
            </button>
          )}

          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <BsX /> : <span>☰</span>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="search-container">
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Pretraži salone..."
                  autoFocus
                />
                <button 
                  type="button" 
                  className="search-close-btn"
                  onClick={handleCloseSearch}
                >
                  <BsX />
                </button>
              </div>

              <AnimatePresence>
                {(searchTerm.trim().length >= 2 || isLoading) && (
                  <motion.div 
                    className="search-results-container"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {isLoading ? (
                      <div className="search-loading">
                        <div className="loading-spinner"></div>
                        <span>Pretraživanje...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(salon => (
                        <motion.div 
                          key={salon.id} 
                          className="salon-card"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            navigate(`/booking/${salon.slug}`);
                            setIsSearchOpen(false);
                            setSearchTerm('');
                          }}
                        >
                          <div className="salon-card-content">
                            <h3>{salon.salon_naziv}</h3>
                            <div className="salon-details">
                              <p className="salon-location">
                                <BsGeoAlt /> {salon.adresa}, {salon.grad}
                              </p>
                              <p className="salon-phone">
                                <BsTelephone /> {salon.telefon}
                              </p>
                            </div>
                            <button className="book-button">
                              Zakaži termin <BsArrowRight />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="no-results">
                        <BsSearch />
                        <p>Nema pronađenih salona</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              className="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              className="mobile-menu"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <button 
                className="mobile-menu-close"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BsX />
              </button>
              <ul className="mobile-nav-links">
                <li>
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <BsHouseDoor /> Početna
                  </Link>
                </li>
                <li>
                  <Link to="/services" onClick={() => setIsMobileMenuOpen(false)}>
                    <BsScissors /> Usluge
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                    <BsCash /> Cenovnik
                  </Link>
                </li>
                <li>
                  <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
                    <BsInfoCircle /> O nama
                  </Link>
                </li>
                <li>
                  <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                    <BsEnvelope /> Kontakt
                  </Link>
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NewNavbar;