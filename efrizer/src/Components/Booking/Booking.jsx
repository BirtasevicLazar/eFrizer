import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BsCalendar, BsClock, BsScissors, BsPerson } from 'react-icons/bs';
import './Booking.css';
import { toast, Toaster } from 'react-hot-toast';

const Booking = () => {
  const { slug } = useParams();
  const [step, setStep] = useState(1);
  const [salonData, setSalonData] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [selectedServiceDuration, setSelectedServiceDuration] = useState(null);

  useEffect(() => {
    fetchSalonData();
  }, [slug]);

  const fetchSalonData = async () => {
    try {
      const response = await fetch('http://192.168.0.31:8888/efrizer/php_api/get_salon_by_slug.php', {
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
      const response = await fetch('http://192.168.0.31:8888/efrizer/php_api/get_services.php', {
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

  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    setAvailableSlots([]);
    setSelectedSlot('');
    
    if (selectedDate) {
        fetchAvailableSlots(selectedDate, serviceId);
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setAvailableSlots([]);
    setSelectedSlot('');
    
    if (selectedService) {
        await fetchAvailableSlots(date, selectedService);
    }
  };

  const fetchAvailableSlots = async (date, serviceId) => {
    try {
      const response = await fetch('http://192.168.0.31:8888/efrizer/php_api/get_available_slots.php', {
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
    }
  };

  const handleNextStep = () => {
    switch(step) {
      case 1:
        if (!selectedService) return;
        break;
      case 2:
        if (!selectedDate) return;
        break;
      case 3:
        if (!selectedSlot) return;
        break;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step === 3) {
        setAvailableSlots([]);
        setSelectedSlot('');
    }
    setStep(prev => prev - 1);
  };

  const validateCurrentStep = () => {
    switch(step) {
      case 1:
        return selectedService !== null;
      case 2:
        return selectedDate !== '';
      case 3:
        return selectedSlot !== '';
      default:
        return true;
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service.id);
    setSelectedServiceDuration(service.trajanje);
    setAvailableSlots([]);
    setSelectedSlot('');
    setSelectedDate('');
  };

  const formatEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(hours, 10));
    startDate.setMinutes(parseInt(minutes, 10));
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderTimeSlots = () => {
    return (
      <div className="booking-slots">
        <div className="slot-info">
          <BsClock /> Trajanje termina: {selectedServiceDuration} min
        </div>
        {availableSlots.length > 0 ? (
          <div className="slots-grid">
            {availableSlots.map(slot => {
              const startTime = slot.slice(0, 5);
              const endTime = formatEndTime(slot, selectedServiceDuration);
              
              return (
                <button
                  key={slot}
                  className={`booking-time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <span className="time-range">
                    {startTime} - {endTime}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="no-slots-message">
            Nema dostupnih termina za izabrani datum. Molimo vas izaberite drugi datum.
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <>
            <h3 className="step-title">
              <BsScissors /> Izaberite uslugu
            </h3>
            <div className="booking-services">
              {services.map(service => (
                <div
                  key={service.id}
                  className={`booking-service-card ${selectedService === service.id ? 'selected' : ''}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <h4>{service.naziv_usluge}</h4>
                  <div className="service-details">
                    <span className="price">{service.cena} {service.valuta}</span>
                    <span className="duration">
                      <BsClock /> {service.trajanje} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case 2:
        return (
          <div className="booking-calendar">
            <h3><BsCalendar /> Izaberite datum</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        );

      case 3:
        return renderTimeSlots();

      case 4:
        return (
          <div className="booking-customer-info">
            <h3><BsPerson /> Vaši podaci</h3>
            <input
              type="text"
              placeholder="Ime i prezime"
              value={customerData.name}
              onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
            />
            <input
              type="tel"
              placeholder="Telefon"
              value={customerData.phone}
              onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
            />
            <input
              type="email"
              placeholder="Email"
              value={customerData.email}
              onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerData.name.trim() || !customerData.phone.trim() || !customerData.email.trim()) {
      toast.error('Molimo popunite sva polja');
      return;
    }
    
    try {
      const response = await fetch('http://192.168.0.31:8888/efrizer/php_api/create_appointment.php', {
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
        toast.success('Uspešno ste zakazali termin!');
        setSelectedService(null);
        setSelectedDate('');
        setSelectedSlot('');
        setCustomerData({ name: '', phone: '', email: '' });
        setStep(1);
      } else {
        toast.error(data.error || 'Došlo je do greške prilikom zakazivanja');
      }
    } catch (error) {
      console.error('Greška:', error);
      toast.error('Došlo je do greške u komunikaciji sa serverom');
    }
  };

  return (
    <div className="booking-wrapper">
      <Toaster position="top-right" />
      <div className="booking-main">
        <div className="booking-header">
          <h1>{salonData?.salonName}</h1>
          <p>{salonData?.address}, {salonData?.city}</p>
        </div>

        <div className="booking-progress">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className={`booking-step ${step >= num ? 'active' : ''}`}>
              {num}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {renderStepContent()}
          
          <div className="booking-nav">
            {step > 1 && (
              <button type="button" className="booking-btn-prev" onClick={handlePrevStep}>
                Nazad
              </button>
            )}
            {step < 4 ? (
              <button type="button" className="booking-btn-next" onClick={handleNextStep}>
                Dalje
              </button>
            ) : (
              <button type="submit" className="booking-btn-next">
                Zakaži termin
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;