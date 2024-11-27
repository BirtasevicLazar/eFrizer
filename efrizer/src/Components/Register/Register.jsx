import React, { useState } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { BsShop, BsPerson, BsEnvelope, BsPhone, BsLock, BsGeoAlt } from 'react-icons/bs';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    salonName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    terms: false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.salonName.trim()) newErrors.salonName = 'Ime salona je obavezno';
      if (!formData.ownerName.trim()) newErrors.ownerName = 'Ime vlasnika je obavezno';
    }

    if (currentStep === 2) {
      if (!formData.email) {
        newErrors.email = 'Email je obavezan';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email nije validan';
      }
      if (!formData.phone) newErrors.phone = 'Telefon je obavezan';
      if (!formData.address.trim()) newErrors.address = 'Adresa je obavezna';
      if (!formData.city.trim()) newErrors.city = 'Grad je obavezan';
    }

    if (currentStep === 3) {
      if (!formData.password) {
        newErrors.password = 'Lozinka je obavezna';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Lozinka mora imati najmanje 6 karaktera';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Lozinke se ne poklapaju';
      }
      if (!formData.terms) {
        newErrors.terms = 'Morate prihvatiti uslove korišćenja';
      }
    }

    return newErrors;
  };

  const handleNextStep = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length === 0) {
      setStep(prev => prev + 1);
    } else {
      setErrors(stepErrors);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stepErrors = validateStep(3);
    
    if (Object.keys(stepErrors).length === 0) {
      try {
        const registrationData = {
          salonName: formData.salonName.trim(),
          ownerName: formData.ownerName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          address: formData.address.trim(),
          city: formData.city.trim()
        };

        const response = await fetch('http://192.168.0.31:8888/efrizer/php_api/register.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(registrationData)
        });

        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('salonId', data.salonId);
          localStorage.setItem('salonData', JSON.stringify({
            ...registrationData,
            id: data.salonId
          }));
          alert('Uspešno ste registrovali salon!');
          navigate('/dashboard');
        } else {
          alert(data.error || 'Došlo je do greške prilikom registracije');
        }
      } catch (error) {
        console.error('Greška:', error);
        alert('Došlo je do greške prilikom povezivanja sa serverom');
      }
    } else {
      setErrors(stepErrors);
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <>
            <div className="form-group">
              <div className="input-icon">
                <BsShop className="icon" />
                <input
                  type="text"
                  placeholder="Ime salona"
                  name="salonName"
                  value={formData.salonName}
                  onChange={handleChange}
                  className={errors.salonName ? 'error' : ''}
                />
              </div>
              {errors.salonName && <span className="error-message">{errors.salonName}</span>}
            </div>

            <div className="form-group">
              <div className="input-icon">
                <BsPerson className="icon" />
                <input
                  type="text"
                  placeholder="Ime i prezime vlasnika"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className={errors.ownerName ? 'error' : ''}
                />
              </div>
              {errors.ownerName && <span className="error-message">{errors.ownerName}</span>}
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="form-group">
              <div className="input-icon">
                <BsEnvelope className="icon" />
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <div className="input-icon">
                <BsPhone className="icon" />
                <input
                  type="tel"
                  placeholder="Telefon"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                />
              </div>
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <div className="input-icon">
                <BsGeoAlt className="icon" />
                <input
                  type="text"
                  placeholder="Adresa"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'error' : ''}
                />
              </div>
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-group">
              <div className="input-icon">
                <BsGeoAlt className="icon" />
                <input
                  type="text"
                  placeholder="Grad"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? 'error' : ''}
                />
              </div>
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="form-group">
              <div className="input-icon">
                <BsLock className="icon" />
                <input
                  type="password"
                  placeholder="Lozinka"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                />
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <div className="input-icon">
                <BsLock className="icon" />
                <input
                  type="password"
                  placeholder="Potvrda lozinke"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                />
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
              <label htmlFor="terms">Prihvatam uslove korišćenja</label>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Registracija Salona</h2>
        <div className="steps-indicator">
          {[1, 2, 3].map((num) => (
            <div key={num} className={`step ${step >= num ? 'active' : ''}`}>
              {num}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          {renderStepContent()}
          
          <div className="buttons-container">
            {step > 1 && (
              <button type="button" onClick={handlePrevStep} className="prev-button">
                Nazad
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={handleNextStep} className="next-button">
                Dalje
              </button>
            ) : (
              <button type="submit" className="submit-button">
                Registruj se
              </button>
            )}
          </div>
          <div className="login-link">
            Već imate nalog? <span onClick={() => navigate('/login')}>Prijavite se</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 