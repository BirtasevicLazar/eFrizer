import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPersonCircle, BsPeople, BsBoxArrowRight } from 'react-icons/bs';
import { Toaster, toast } from 'react-hot-toast';
import './styles/Dashboard.css';
import ProfileSection from './ProfileSection';
import BarbersSection from './BarbersSection';
import { API_BASE_URL } from '../../config'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [salonData, setSalonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalonData = async () => {
      const salonId = localStorage.getItem('salonId');
      
      if (!salonId) {
        navigate('/');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/get_salon_data.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ salonId })
        });

        const data = await response.json();
        if (data.success) {
          setSalonData(data.salon);
        } else {
          toast.error('Greška pri učitavanju podataka');
          navigate('/login');
        }
      } catch (error) {
        console.error('Greška:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchSalonData();
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('Da li ste sigurni da želite da se odjavite?')) {
      localStorage.removeItem('salonId');
      navigate('/');
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return <ProfileSection salonData={salonData} setSalonData={setSalonData} />;
      case 'barbers':
        return <BarbersSection salonId={salonData?.id} />;
      default:
        return <ProfileSection salonData={salonData} setSalonData={setSalonData} />;
    }
  };

  if (loading) {
    return <div className="e-loading">Učitavanje...</div>;
  }

  return (
    <div className="e-dashboard">
      <Toaster position="top-right" />
      
      <aside className="e-sidebar">
        <div className="e-salon-info">
          <div className="e-salon-avatar">
            <BsPersonCircle />
          </div>
          <h3 className="e-salon-name">{salonData?.salonName}</h3>
        </div>

        <nav className="e-nav">
          <button 
            className={`e-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <BsPersonCircle /> Profil
          </button>
          <button 
            className={`e-nav-item ${activeTab === 'barbers' ? 'active' : ''}`}
            onClick={() => setActiveTab('barbers')}
          >
            <BsPeople /> Frizeri
          </button>
          <button 
            className="e-nav-item e-logout"
            onClick={handleLogout}
          >
            <BsBoxArrowRight /> Odjavi se
          </button>
        </nav>
      </aside>

      <main className="e-main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;