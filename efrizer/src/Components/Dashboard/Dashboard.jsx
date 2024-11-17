import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPersonCircle, BsCalendar, BsScissors, BsGraphUp, BsPencil, BsCheckLg, BsX, BsBoxArrowRight } from 'react-icons/bs';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [salonData, setSalonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchSalonData = async () => {
      const salonId = localStorage.getItem('salonId');
      
      if (!salonId) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch('http://192.168.0.25:8888/efrizer/php_api/get_salon_data.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ salonId })
        });

        if (!response.ok) {
          throw new Error('Mrežna greška');
        }

        const data = await response.json();
        if (data.success) {
          setSalonData(data.salon);
          setFormData(data.salon);
        } else {
          console.error('Greška pri učitavanju podataka:', data.error);
          navigate('/login');
        }
      } catch (error) {
        console.error('Greška pri komunikaciji sa serverom:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchSalonData();
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({...salonData});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.salonName?.trim() || !formData.ownerName?.trim() || 
        !formData.address?.trim() || !formData.city?.trim()) {
      alert('Sva polja moraju biti popunjena');
      return;
    }

    try {
      const response = await fetch('http://192.168.0.25:8888/efrizer/php_api/update_salon.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: salonData.id
        })
      });

      if (!response.ok) {
        throw new Error('Mrežna greška');
      }

      const data = await response.json();
      
      if (data.success) {
        setSalonData(data.salonData);
        setIsEditing(false);
        alert('Podaci uspešno ažurirani!');
      } else {
        alert(data.error || 'Greška pri ažuriranju podataka');
      }
    } catch (error) {
      console.error('Greška:', error);
      alert('Došlo je do greške pri komunikaciji sa serverom');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div>Učitavanje...</div>;
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return <ProfileSection salonData={salonData} setSalonData={setSalonData} />;
      case 'appointments':
        return <AppointmentsSection salonId={salonData.id} />;
      case 'services':
        return <ServicesSection salonId={salonData.id} />;
      case 'statistics':
        return <StatisticsSection salonId={salonData.id} />;
      default:
        return <ProfileSection salonData={salonData} setSalonData={setSalonData} />;
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Da li ste sigurni da želite da se odjavite?');
    if (confirmLogout) {
      localStorage.removeItem('salonId');
      navigate('/');
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="salon-info">
          <div className="salon-avatar">
            <BsScissors />
          </div>
          <h3>{salonData?.salonName}</h3>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <BsPersonCircle /> Profil
          </button>
          <button 
            className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <BsCalendar /> Termini
          </button>
          <button 
            className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <BsScissors /> Usluge
          </button>
          <button 
            className={`nav-item ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <BsGraphUp /> Statistika
          </button>
          <button 
            className="nav-item logout-button"
            onClick={handleLogout}
          >
            <BsBoxArrowRight /> Odjavi se
          </button>
        </nav>
      </aside>

      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
};

const ProfileSection = ({ salonData, setSalonData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...salonData});

  useEffect(() => {
    if (salonData) {
      setFormData(salonData);
    }
  }, [salonData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.salonName?.trim() || !formData.ownerName?.trim() || 
        !formData.address?.trim() || !formData.city?.trim()) {
      alert('Sva polja moraju biti popunjena');
      return;
    }

    try {
      const response = await fetch('http://192.168.0.25:8888/efrizer/php_api/update_salon.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: salonData.id
        })
      });

      if (!response.ok) {
        throw new Error('Mrežna greška');
      }

      const data = await response.json();
      
      if (data.success) {
        setSalonData(data.salonData);
        setFormData(data.salonData);
        setIsEditing(false);
        alert('Podaci uspešno ažurirani!');
      } else {
        alert(data.error || 'Greška pri ažuriranju podataka');
      }
    } catch (error) {
      console.error('Greška:', error);
      alert('Došlo je do greške pri komunikaciji sa serverom');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({...salonData});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({...salonData});
  };

  return (
    <div className="dashboard-section">
      <h2>Profil Salona</h2>
      <form className="profile-info">
        <div className="info-group">
          <label>Naziv salona</label>
          <input 
            type="text" 
            value={formData.salonName} 
            onChange={(e) => isEditing && setFormData({...formData, salonName: e.target.value})}
            readOnly={!isEditing}
            className={!isEditing ? 'readonly-field' : ''}
          />
        </div>
        <div className="info-group">
          <label>Ime vlasnika</label>
          <input 
            type="text" 
            value={formData.ownerName}
            onChange={(e) => isEditing && setFormData({...formData, ownerName: e.target.value})}
            readOnly={!isEditing}
            className={!isEditing ? 'readonly-field' : ''}
          />
        </div>
        <div className="info-group">
          <label>Email</label>
          <input 
            type="email" 
            value={formData.email}
            readOnly={true}
            className="readonly-field"
          />
        </div>
        <div className="info-group">
          <label>Telefon</label>
          <input 
            type="text" 
            value={formData.phone}
            readOnly={true}
            className="readonly-field"
          />
        </div>
        <div className="info-group">
          <label>Adresa</label>
          <input 
            type="text" 
            value={formData.address}
            onChange={(e) => isEditing && setFormData({...formData, address: e.target.value})}
            readOnly={!isEditing}
            className={!isEditing ? 'readonly-field' : ''}
          />
        </div>
        <div className="info-group">
          <label>Grad</label>
          <input 
            type="text" 
            value={formData.city}
            onChange={(e) => isEditing && setFormData({...formData, city: e.target.value})}
            readOnly={!isEditing}
            className={!isEditing ? 'readonly-field' : ''}
          />
        </div>
        <div className="button-group">
          {!isEditing ? (
            <button 
              type="button" 
              className="edit-button"
              onClick={handleEdit}
            >
              <BsPencil /> Izmeni
            </button>
          ) : (
            <>
              <button 
                type="button" 
                className="save-button"
                onClick={handleSubmit}
              >
                <BsCheckLg /> Sačuvaj
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={handleCancel}
              >
                <BsX /> Otkaži
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

const AppointmentsSection = ({ salonId }) => {
  return (
    <div className="dashboard-section">
      <h2>Termini</h2>
      {/* Implementacija termina */}
    </div>
  );
};

const ServicesSection = ({ salonId }) => {
  return (
    <div className="dashboard-section">
      <h2>Usluge</h2>
      {/* Implementacija usluga */}
    </div>
  );
};

const StatisticsSection = ({ salonId }) => {
  return (
    <div className="dashboard-section">
      <h2>Statistika</h2>
      {/* Implementacija statistike */}
    </div>
  );
};

export default Dashboard;