import React, { useState } from 'react';
import { BsPersonCircle, BsPencil, BsCheckLg, BsX, BsLink45Deg } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import './styles/ProfileSection.css';

const ProfileSection = ({ salonData, setSalonData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    salonName: salonData?.salonName || '',
    ownerName: salonData?.ownerName || '',
    email: salonData?.email || '',
    phone: salonData?.phone || '',
    address: salonData?.address || '',
    city: salonData?.city || ''
  });

  const bookingUrl = `http://192.168.0.31:5173/booking/${salonData?.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast.success('Link kopiran u clipboard!');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://192.168.0.31:8888/efrizer/php_api/update_salon.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          salonId: salonData.id
        })
      });

      const data = await response.json();
      if (data.success) {
        setSalonData({
          ...salonData,
          ...formData
        });
        setIsEditing(false);
        toast.success('Podaci su uspešno ažurirani');
      } else {
        toast.error(data.error || 'Greška pri ažuriranju podataka');
      }
    } catch (error) {
      console.error('Greška:', error);
      toast.error('Greška pri ažuriranju podataka');
    }
  };

  return (
    <div className="e-profile-section">
      {!isEditing ? (
        <div className="e-profile-data">
          <div className="e-profile-header">
            <h2>Profil Salona</h2>
            <button 
              className="e-edit-button"
              onClick={() => setIsEditing(true)}
            >
              <BsPencil /> Izmeni
            </button>
          </div>

          <div className="e-profile-info">
            <div className="e-info-group">
              <label>Ime Salona</label>
              <p>{salonData?.salonName}</p>
            </div>
            <div className="e-info-group">
              <label>Vlasnik</label>
              <p>{salonData?.ownerName}</p>
            </div>
            <div className="e-info-group">
              <label>Email</label>
              <p>{salonData?.email}</p>
            </div>
            <div className="e-info-group">
              <label>Telefon</label>
              <p>{salonData?.phone}</p>
            </div>
            <div className="e-info-group">
              <label>Adresa</label>
              <p>{salonData?.address}</p>
            </div>
            <div className="e-info-group">
              <label>Grad</label>
              <p>{salonData?.city}</p>
            </div>
          </div>

          <div className="e-booking-url">
            <p>Link za zakazivanje:</p>
            <div className="e-url-container">
              <span className="e-url">{bookingUrl}</span>
              <button 
                className="e-copy-btn"
                onClick={copyToClipboard}
              >
                <BsLink45Deg /> Kopiraj
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="e-edit-form">
          <div className="e-form-group">
            <label>Ime Salona</label>
            <input
              type="text"
              name="salonName"
              value={formData.salonName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="e-form-group">
            <label>Vlasnik</label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="e-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="e-form-group">
            <label>Telefon</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="e-form-group">
            <label>Adresa</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="e-form-group">
            <label>Grad</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="e-form-actions">
            <button type="submit" className="e-submit-btn">
              <BsCheckLg /> Sačuvaj
            </button>
            <button 
              type="button" 
              className="e-cancel-btn"
              onClick={() => setIsEditing(false)}
            >
              <BsX /> Otkaži
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileSection; 