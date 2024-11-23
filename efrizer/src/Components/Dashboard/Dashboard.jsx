import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPersonCircle, BsCalendar, BsScissors, BsGraphUp, BsPencil, BsCheckLg, BsX, BsBoxArrowRight, BsClock, BsLink45Deg } from 'react-icons/bs';
import { Toaster, toast } from 'react-hot-toast';
import './Dashboard.css';

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
        const response = await fetch('http://192.168.0.27:8888/efrizer/php_api/get_salon_data.php', {
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

  const handleLogout = () => {
    const confirmLogout = window.confirm('Da li ste sigurni da želite da se odjavite?');
    if (confirmLogout) {
      localStorage.removeItem('salonId');
      navigate('/');
    }
  };

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
      case 'working_hours':
        return <WorkingHoursSection salonId={salonData.id} />;
      default:
        return <ProfileSection salonData={salonData} setSalonData={setSalonData} />;
    }
  };

  if (loading) {
    return <div>Učitavanje...</div>;
  }

  return (
    <div className="dashboard">
      <Toaster position="top-right" />
      <aside className="sidebar">
        <div className="salon-info">
          <div className="salon-avatar">
            <BsPersonCircle />
          </div>
          <h3>{salonData.salonName}</h3>
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
            className={`nav-item ${activeTab === 'working_hours' ? 'active' : ''}`}
            onClick={() => setActiveTab('working_hours')}
          >
            <BsClock /> Radno vreme
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
    
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(salonData);
    
    if (!isEditing || !hasChanges) {
      return;
    }

    if (!formData.salonName?.trim() || !formData.ownerName?.trim() || 
        !formData.address?.trim() || !formData.city?.trim()) {
      toast.error('Sva polja moraju biti popunjena');
      return;
    }

    try {
      const response = await fetch('http://192.168.0.27:8888/efrizer/php_api/update_salon.php', {
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
        toast.success('Podaci uspešno ažurirani!');
      } else {
        toast.error(data.error || 'Greška pri ažuriranju podataka');
      }
    } catch (error) {
      console.error('Greška:', error);
      toast.error('Došlo je do greške pri komunikaciji sa serverom');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({...salonData});
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/booking/${salonData.slug}`;
    navigator.clipboard.writeText(link);
    alert('Link je kopiran u clipboard!');
  };

  const bookingLink = `${window.location.origin}/booking/${salonData.slug}`;

  return (
    <div className="dashboard-section">
      <h2>Profil Salona</h2>
      <form onSubmit={handleSubmit} className="profile-info">
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
        <div className="booking-link-container">
          <label>Link za zakazivanje:</label>
          <div className="booking-link">
            <BsLink45Deg />
            <span>{bookingLink}</span>
          </div>
        </div>
        <div className="form-actions">
          {isEditing ? (
            <>
              <button type="submit" className="save-button">
                <BsCheckLg /> Sačuvaj
              </button>
              <button type="button" onClick={handleCancel} className="cancel-button">
                <BsX /> Otkaži
              </button>
            </>
          ) : (
            <button type="button" onClick={handleEdit} className="edit-button">
              <BsPencil /> Izmeni
            </button>
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
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    naziv_usluge: '',
    cena: '',
    trajanje: '',
    opis: '',
    valuta: 'RSD'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddService = async (e) => {
    e.preventDefault();

    if (!newService.naziv_usluge || !newService.cena || !newService.trajanje) {
      alert('Naziv usluge, cena i trajanje su obavezni');
      return;
    }

    try {
      const response = await fetch('http://192.168.0.27:8888/efrizer/php_api/add_service.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newService,
          salon_id: salonId
        })
      });

      const data = await response.json();

      if (data.success && data.service) {
        setServices(prev => [...prev, data.service]);
        setNewService({ naziv_usluge: '', opis: '', cena: '', trajanje: '', valuta: 'RSD' });
        alert('Usluga uspešno dodata!');
      } else {
        alert(data.error || 'Greška pri dodavanju usluge');
      }
    } catch (error) {
      console.error('Greška:', error);
      alert('Došlo je do greške pri komunikaciji sa serverom');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovu uslugu?')) {
      try {
        const response = await fetch('http://192.168.0.27:8888/efrizer/php_api/delete_service.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ serviceId })
        });

        const data = await response.json();
        if (data.success) {
          setServices(services.filter(service => service.id !== serviceId));
        } else {
          alert(data.error || 'Greška pri brisanju usluge');
        }
      } catch (error) {
        console.error('Greška:', error);
        alert('Došlo je do greške pri komunikaciji sa serverom');
      }
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://192.168.0.27:8888/efrizer/php_api/get_services.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ salonId })
        });

        const data = await response.json();
        if (data.success) {
          setServices(data.services);
        } else {
          console.error('Greška pri učitavanju usluga:', data.error);
        }
      } catch (error) {
        console.error('Greška pri komunikaciji sa serverom:', error);
      }
    };

    fetchServices();
  }, [salonId]);

  return (
    <div className="dashboard-section services-section">
      <div className="content-wrapper">
        <form onSubmit={handleAddService} className="service-form">
          <div className="form-header">
            <h3>Dodaj novu uslugu</h3>
          </div>
          
          <div className="form-body">
            <div className="form-group">
              <input
                type="text"
                name="naziv_usluge"
                value={newService.naziv_usluge}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label>Naziv usluge</label>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <input
                  type="number"
                  name="cena"
                  value={newService.cena}
                  onChange={handleChange}
                  placeholder=" "
                  required
                />
                <label>Cena</label>
              </div>

              <div className="form-group">
                <select
                  name="valuta"
                  value={newService.valuta}
                  onChange={handleChange}
                  required
                >
                  <option value="RSD">RSD</option>  
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <input
                type="number"
                name="trajanje"
                value={newService.trajanje}
                onChange={handleChange}
                placeholder=" "
                required
              />
              <label>Trajanje (min)</label>
            </div>
            
            <div className="form-group">
              <textarea
                name="opis"
                value={newService.opis}
                onChange={handleChange}
                placeholder=" "
                rows="3"
              />
              <label>Opis usluge</label>
            </div>
          </div>

          <div className="form-footer">
            <button type="submit" className="submit-btn">
              Dodaj uslugu
            </button>
          </div>
        </form>

        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-card-header">
                <h4>{service.naziv_usluge}</h4>
                <div className="service-actions">
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <BsX />
                  </button>
                </div>
              </div>
              <div className="service-card-body">
                <div className="service-details">
                  <span className="service-price">
                    <span className="price-amount">{service.cena}</span>
                    <span className="price-currency">{service.valuta}</span>
                  </span>
                  <span className="service-duration">
                    <BsClock /> {service.trajanje} min
                  </span>
                </div>
                {service.opis && (
                  <p className="service-description">{service.opis}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
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

const WorkingHoursSection = ({ salonId }) => {
  const [workingHours, setWorkingHours] = useState([
    { day_of_week: 1, name: 'Ponedeljak', start_time: '', end_time: '', break_start: '', break_end: '', is_working: false },
    { day_of_week: 2, name: 'Utorak', start_time: '', end_time: '', break_start: '', break_end: '', is_working: false },
    { day_of_week: 3, name: 'Sreda', start_time: '', end_time: '', break_start: '', break_end: '', is_working: false },
    { day_of_week: 4, name: 'Četvrtak', start_time: '', end_time: '', break_start: '', break_end: '', is_working: false },
    { day_of_week: 5, name: 'Petak', start_time: '', end_time: '', break_start: '', break_end: '', is_working: false },
    { day_of_week: 6, name: 'Subota', start_time: '', end_time: '', break_start: '', break_end: '', is_working: false },
    { day_of_week: 0, name: 'Nedelja', start_time: '', end_time: '', break_start: '', break_end: '', is_working: false }
  ]);

  useEffect(() => {
    const fetchWorkingHours = async () => {
      try {
        const response = await fetch('http://192.168.0.27:8888/efrizer/php_api/get_working_hours.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ salon_id: salonId })
        });

        const data = await response.json();
        
        if (data.success && data.working_hours.length > 0) {
          const updatedHours = workingHours.map(day => {
            const savedDay = data.working_hours.find(d => d.day_of_week === day.day_of_week);
            if (savedDay) {
              return {
                ...day,
                start_time: savedDay.start_time,
                end_time: savedDay.end_time,
                break_start: savedDay.break_start,
                break_end: savedDay.break_end,
                is_working: savedDay.is_working
              };
            }
            return day;
          });
          setWorkingHours(updatedHours);
        }
      } catch (error) {
        console.error('Greška pri učitavanju radnog vremena:', error);
        toast.error('Greška pri učitavanju radnog vremena');
      }
    };

    fetchWorkingHours();
  }, [salonId]);

  const handleTimeChange = (dayIndex, field, value) => {
    const newHours = [...workingHours];
    const dayToUpdate = newHours.find(day => day.day_of_week === dayIndex);
    if (dayToUpdate) {
      dayToUpdate[field] = value;
      setWorkingHours(newHours);
    }
  };

  const handleWorkingChange = (dayIndex, isWorking) => {
    const newHours = [...workingHours];
    const dayToUpdate = newHours.find(day => day.day_of_week === dayIndex);
    if (dayToUpdate) {
      dayToUpdate.is_working = isWorking;
      setWorkingHours(newHours);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://192.168.0.27:8888/efrizer/php_api/set_working_hours.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salon_id: parseInt(salonId, 10),
          working_hours: workingHours
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Radno vreme je uspešno sačuvano');
      } else {
        toast.error(data.error || 'Greška pri čuvanju radnog vremena');
      }
    } catch (error) {
      console.error('Greška:', error);
      toast.error('Došlo je do greške pri čuvanju radnog vremena');
    }
  };

  return (
    <div className="working-hours-section">
      <h2>Radno Vreme</h2>
      <div className="working-hours-grid">
        {workingHours.map((day) => (
          <div key={day.day_of_week} className={`day-card ${day.is_working ? 'active' : 'inactive'}`}>
            <div className="day-header">
              <h3>{day.name}</h3>
              <div className="toggle-wrapper">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={day.is_working}
                    onChange={(e) => handleWorkingChange(day.day_of_week, e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="working-status">{day.is_working ? 'Radan dan' : 'Neradan dan'}</span>
              </div>
            </div>
            <div className="time-inputs">
              <div className="time-field">
                <label>Početak radnog vremena</label>
                <input
                  type="time"
                  value={day.start_time}
                  onChange={(e) => handleTimeChange(day.day_of_week, 'start_time', e.target.value)}
                  disabled={!day.is_working}
                />
              </div>
              <div className="time-field">
                <label>Kraj radnog vremena</label>
                <input
                  type="time"
                  value={day.end_time}
                  onChange={(e) => handleTimeChange(day.day_of_week, 'end_time', e.target.value)}
                  disabled={!day.is_working}
                />
              </div>
              <div className="break-time-section">
                <h4>Pauza</h4>
                <div className="time-field">
                  <label>Početak pauze</label>
                  <input
                    type="time"
                    value={day.break_start}
                    onChange={(e) => handleTimeChange(day.day_of_week, 'break_start', e.target.value)}
                    disabled={!day.is_working}
                  />
                </div>
                <div className="time-field">
                  <label>Kraj pauze</label>
                  <input
                    type="time"
                    value={day.break_end}
                    onChange={(e) => handleTimeChange(day.day_of_week, 'break_end', e.target.value)}
                    disabled={!day.is_working}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="actions">
        <button onClick={handleSave} className="save-button">
          <BsCheckLg /> Sačuvaj promene
        </button>
      </div>
    </div>
  );
};

export default Dashboard;