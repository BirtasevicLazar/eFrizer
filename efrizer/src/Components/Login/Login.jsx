import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { BsEnvelope, BsLock } from 'react-icons/bs';
import NewNavbar from '../NewNavbar/NewNavbar';
import Footer from '../Footer/Footer';
import { API_BASE_URL } from '../../config'; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Sva polja su obavezna');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login.php`, {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Mrežna greška');
      }

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('salonId', data.salonId.toString());
        localStorage.setItem('salonData', JSON.stringify(data.salonData));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Pogrešni podaci za prijavu');
      }
    } catch (error) {
      console.error('Greška:', error);
      setError('Došlo je do greške prilikom povezivanja sa serverom');
    }
  };

  return (
    <>
      <NewNavbar />
      <div className="login-page">
        <div className="login-container">
          <h2>Prijava</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-icon">
                <BsEnvelope className="icon" />
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-icon">
                <BsLock className="icon" />
                <input
                  type="password"
                  placeholder="Lozinka"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button">
              Prijavi se
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;