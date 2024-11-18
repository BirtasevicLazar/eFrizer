import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BsCalendar, BsClock, BsScissors, BsPerson } from 'react-icons/bs';
import './Booking.css';

const Booking = () => {
  const { slug } = useParams();
  const [salonData, setSalonData] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    fetchSalonData();
  }, [slug]);

  const fetchSalonData = async () => {
    try {
      const response = await fetch('http://192.168.0.25:8888/efrizer/php_api/get_salon_by_slug.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug })
      });
      
      const data = await response.json();
      if (data.success) {
        setSalonData(data.salon);
        fetchServices(data.salon.id);
      }
    } catch (error) {
      console.error('Greška:', error);
    }
  };

  const fetchServices = async (salonId) => {
    try {
      const response = await fetch('http://192.168.0.25:8888/efrizer/php_api/get_services.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salonId })
      });
      
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Greška:', error);
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    if (selectedService) {
      fetchAvailableSlots(date, selectedService);
    }
  };

  const fetchAvailableSlots = async (date, serviceId) => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch('http://192.168.0.25:8888/efrizer/php_api/get_available_slots.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salonId: salonData.id,
          date,
          serviceId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setAvailableSlots(data.slots);
      }
    } catch (error) {
      console.error('Greška:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://192.168.0.25:8888/efrizer/php_api/create_appointment.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salonId: salonData.id,
          serviceId: selectedService,
          date: selectedDate,
          timeSlot: selectedSlot,
          customerData
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Uspešno ste zakazali termin!');
        // Reset forme
        setSelectedService('');
        setSelectedDate('');
        setSelectedSlot('');
        setCustomerData({ name: '', phone: '', email: '' });
      }
    } catch (error) {
      console.error('Greška:', error);
    }
  };

  if (!salonData) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="booking-container">
      <div className="salon-info">
        <h1>{salonData.salonName}</h1>
        <p className="salon-details">
          <BsPerson /> {salonData.ownerName}
          <br />
          {salonData.address}, {salonData.city}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3><BsScissors /> Izaberite uslugu</h3>
          <div className="services-grid">
            {services.length > 0 ? (
              services.map(service => (
                <div
                  key={service.id}
                  className={`service-card ${selectedService === service.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedService(service.id);
                    if (selectedDate) {
                      fetchAvailableSlots(selectedDate, service.id);
                    }
                  }}
                >
                  <h4>{service.naziv_usluge}</h4>
                  <div className="service-details">
                    <span className="price">{service.cena} {service.valuta}</span>
                    <span className="duration"><BsClock /> {service.trajanje} min</span>
                  </div>
                  {service.opis && <p className="description">{service.opis}</p>}
                </div>
              ))
            ) : (
              <p className="no-services">Trenutno nema dostupnih usluga</p>
            )}
          </div>
        </div>

        {selectedService && (
          <>
            <div className="form-section">
              <h3><BsCalendar /> Izaberite datum</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {selectedDate && (
              <div className="form-section">
                <h3><BsClock /> Izaberite termin</h3>
                {isLoadingSlots ? (
                  <div className="loading-slots">Učitavanje dostupnih termina...</div>
                ) : availableSlots.length > 0 ? (
                  <div className="time-slots">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="no-slots">Nema dostupnih termina za izabrani datum</p>
                )}
              </div>
            )}
          </>
        )}

        {selectedSlot && (
          <div className="form-section">
            <h3><BsPerson /> Vaši podaci</h3>
            <div className="customer-form">
              <input
                type="text"
                placeholder="Ime i prezime"
                value={customerData.name}
                onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                required
              />
              <input
                type="tel"
                placeholder="Telefon"
                value={customerData.phone}
                onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={customerData.email}
                onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                required
              />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="submit-button"
          disabled={!selectedService || !selectedDate || !selectedSlot || 
                   !customerData.name || !customerData.phone || !customerData.email}
        >
          Zakaži termin
        </button>
      </form>
    </div>
  );
};

export default Booking;