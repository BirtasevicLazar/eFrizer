import React, { useState, useEffect } from 'react';
import { BsPersonCircle, BsPlus, BsCheckLg, BsX, BsClock, BsScissors, BsCalendar } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import BarberWorkingHours from './BarberComponents/BarberWorkingHours';
import BarberServices from './BarberComponents/BarberServices';
import AppointmentsTable from './BarberComponents/AppointmentsTable';
import './styles/BarbersSection.css';


const BarbersSection = ({ salonId }) => {
  const [barbers, setBarbers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBarber, setNewBarber] = useState({
    ime: '',
    prezime: '',
    telefon: '',
    email: ''
  });
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [activeTab, setActiveTab] = useState('working-hours');

  useEffect(() => {
    fetchBarbers();
  }, [salonId]);

  const fetchBarbers = async () => {
    try {
      const response = await fetch('http://192.168.0.31:8888/efrizer/php_api/get_barbers.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salonId })
      });

      const data = await response.json();
      if (data.success) {
        setBarbers(data.barbers);
      }
    } catch (error) {
      console.error('Greška:', error);
      toast.error('Greška pri učitavanju frizera');
    }
  };

  const handleAddBarber = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://192.168.0.31:8888/efrizer/php_api/add_barber.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newBarber,
          salonId
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Frizer uspešno dodat');
        setNewBarber({ ime: '', prezime: '', telefon: '', email: '' });
        setShowAddForm(false);
        fetchBarbers();
      } else {
        toast.error(data.error || 'Greška pri dodavanju frizera');
      }
    } catch (error) {
      console.error('Greška:', error);
      toast.error('Greška pri dodavanju frizera');
    }
  };

  const renderBarberSubMenu = () => {
    if (!selectedBarber) return null;

    switch(activeTab) {
      case 'working-hours':
        return <BarberWorkingHours barberId={selectedBarber.id} salonId={salonId} />;
      case 'services':
        return <BarberServices barberId={selectedBarber.id} salonId={salonId} />;
      case 'appointments':
        return <AppointmentsTable salonId={salonId} barberId={selectedBarber.id} />;
      default:
        return null;
    }
  };

  return (
    <div className={`e-barbers-section ${selectedBarber ? 'has-selected-barber' : ''}`}>
      <div className="e-barbers-header">
        <h2 className="e-barbers-title">
          {selectedBarber ? 'Detalji frizera' : 'Frizeri'}
        </h2>
        {!selectedBarber && (
          <button 
            className="e-add-barber-btn"
            onClick={() => setShowAddForm(true)}
          >
            <BsPlus /> Dodaj frizera
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddBarber} className="e-add-barber-form">
          <div className="e-form-group">
            <input
              type="text"
              placeholder="Ime"
              value={newBarber.ime}
              onChange={(e) => setNewBarber({...newBarber, ime: e.target.value})}
              required
            />
          </div>
          <div className="e-form-group">
            <input
              type="text"
              placeholder="Prezime"
              value={newBarber.prezime}
              onChange={(e) => setNewBarber({...newBarber, prezime: e.target.value})}
              required
            />
          </div>
          <div className="e-form-group">
            <input
              type="tel"
              placeholder="Telefon"
              value={newBarber.telefon}
              onChange={(e) => setNewBarber({...newBarber, telefon: e.target.value})}
              required
            />
          </div>
          <div className="e-form-group">
            <input
              type="email"
              placeholder="Email"
              value={newBarber.email}
              onChange={(e) => setNewBarber({...newBarber, email: e.target.value})}
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
              onClick={() => setShowAddForm(false)}
            >
              <BsX /> Otkaži
            </button>
          </div>
        </form>
      )}

      {!selectedBarber && (
        <div className="e-barbers-grid">
          {barbers.map((barber) => (
            <div 
              key={barber.id} 
              className="e-barber-card"
              onClick={() => setSelectedBarber(barber)}
            >
              <div className="e-barber-avatar">
                <BsPersonCircle />
              </div>
              <div className="e-barber-info">
                <h3 className="e-barber-name">{barber.ime} {barber.prezime}</h3>
                <p className="e-barber-contact">{barber.telefon}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBarber && (
        <div className="e-barber-submenu">
          <div className="e-submenu-header">
            <h3 className="e-barber-name">{selectedBarber.ime} {selectedBarber.prezime}</h3>
            <button 
              className="e-close-submenu"
              onClick={() => setSelectedBarber(null)}
            >
              <BsX />
            </button>
          </div>
          
          <div className="e-barber-tabs">
            <button 
              className={`e-tab-btn ${activeTab === 'working-hours' ? 'active' : ''}`}
              onClick={() => setActiveTab('working-hours')}
            >
              <BsClock /> <span>Radno vreme</span>
            </button>
            <button 
              className={`e-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <BsScissors /> <span>Usluge</span>
            </button>
            <button 
              className={`e-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              <BsCalendar /> <span>Termini</span>
            </button>
          </div>

          <div className="e-submenu-content">
            {renderBarberSubMenu()}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarbersSection; 