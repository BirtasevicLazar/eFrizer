import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BsCalendar, BsClock, BsScissors, BsPerson, BsArrowLeft, BsFacebook, BsInstagram, BsTwitter, BsLinkedin, BsEnvelope, BsTelephone, BsGeoAlt, BsPersonCircle, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import './Booking.css';
import { toast, Toaster } from 'react-hot-toast';
import Footer from '../Footer/Footer';
import { format, subDays, addDays } from 'date-fns';
import { API_BASE_URL } from '../../config';

const Booking = () => {
  const { slug } = useParams();
  const [step, setStep] = useState(1);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [salonData, setSalonData] = useState(null);
  const [selectedServiceDuration, setSelectedServiceDuration] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchSalonData();
    }
  }, [slug]);

  useEffect(() => {
    if (selectedDate && selectedBarber && selectedService) {
      fetchTimeSlots();
    }
  }, [selectedDate]);

  const fetchSalonData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_salon_by_slug.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug })
      });
      
      const data = await response.json();
      if (data.success) {
        setSalonData(data.salon);
        fetchBarbers(data.salon.id);
      }
    } catch (error) {
      console.error('Greška:', error);
      toast.error('Greška pri učitavanju podataka o salonu');
    }
  };

  const fetchBarbers = async (salonId) => {
    try {
      console.log('Fetching barbers for salon:', salonId);

      const response = await fetch(`${API_BASE_URL}/get_barbers.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salonId: salonId })
      });

      const data = await response.json();
      console.log('Barbers response:', data);

      if (data.success) {
        setBarbers(data.barbers);
        if (data.barbers.length === 0) {
          toast.error('Trenutno nema dostupnih frizera');
        }
      } else {
        toast.error('Greška pri učitavanju frizera');
        console.error('Error fetching barbers:', data.error);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Greška pri učitavanju frizera');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_services.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          salonId: salonData?.id,
          barberId: selectedBarber?.id 
        })
      });
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      toast.error('Greška pri učitavanju usluga');
    }
  };

  const fetchTimeSlots = async () => {
    try {
      if (!selectedDate || !selectedBarber || !salonData?.id || !selectedService) {
        console.log('Nedostaju potrebni podaci:', {
          date: selectedDate,
          barber: selectedBarber,
          salon: salonData?.id,
          service: selectedService
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/get_available_slots.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salonId: salonData.id,
          barberId: selectedBarber.id,
          date: selectedDate,
          serviceId: selectedService
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTimeSlots(data.slots);
      } else {
        toast.error(data.error || 'Greška pri učitavanju termina');
      }
    } catch (error) {
      console.error('Greška:', error);
      toast.error('Došlo je do greške pri učitavanju termina');
    }
  };

  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    setTimeSlots([]);
    setSelectedSlot('');
    
    if (selectedDate) {
        fetchTimeSlots(selectedDate, serviceId);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot('');
  };

  const handlePrevDate = () => {
    if (selectedDate) {
      const currentDate = new Date();
      const newDate = subDays(new Date(selectedDate), 1);
      
      if (newDate >= currentDate) {
        setSelectedDate(format(newDate, 'yyyy-MM-dd'));
      } else {
        toast.error('Ne možete zakazati termin za prošle datume');
      }
    }
  };

  const handleNextDate = () => {
    if (selectedDate) {
      const newDate = addDays(new Date(selectedDate), 1);
      setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    }
  };

  const handleNextStep = () => {
    switch(step) {
      case 1:
        if (!selectedBarber) {
          toast.error('Molimo izaberite frizera');
          return;
        }
        fetchServices();
        break;
      case 2:
        if (!selectedService) {
          toast.error('Molimo izaberite uslugu');
          return;
        }
        break;
      case 3:
        if (!selectedDate) {
          toast.error('Molimo izaberite datum');
          return;
        }
        break;
      case 4:
        if (!selectedSlot) {
          toast.error('Molimo izaberite termin');
          return;
        }
        break;
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (step === 3) {
        setTimeSlots([]);
        setSelectedSlot('');
    }
    setStep(prev => prev - 1);
  };

  const validateCurrentStep = () => {
    switch(step) {
      case 1:
        return selectedBarber !== null;
      case 2:
        return selectedService !== null;
      case 3:
        return selectedDate !== '';
      case 4:
        return selectedSlot !== '';
      case 5:
        return customerData.name && customerData.phone && customerData.email;
      default:
        return true;
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service.id);
    setSelectedServiceDuration(service.trajanje);
    setSelectedDate('');
    setSelectedSlot('');
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
        {timeSlots.length > 0 ? (
          <div className="slots-grid">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                className={`booking-time-slot ${selectedSlot === slot.start ? 'selected' : ''}`}
                onClick={() => setSelectedSlot(slot.start)}
              >
                <span className="time-range">
                  {slot.start} - {slot.end}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="no-slots-message">
            Nema dostupnih termina za izabrani datum.
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return renderBarbers();
      case 2:
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
      case 3:
        return (
          <>
            <h3 className="step-title">
              <BsCalendar /> Izaberite datum
            </h3>
            <div className="date-selection">
              <div className="date-navigation">
                <button 
                  type="button"
                  onClick={handlePrevDate}
                  disabled={selectedDate === format(new Date(), 'yyyy-MM-dd')}
                >
                  <BsChevronLeft /> <span>Prethodni dan</span>
                </button>
                <div className="current-date">
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="ef-datepicker-input"
                  />
                </div>
                <button type="button" onClick={handleNextDate}>
                  <span>Sledeći dan</span> <BsChevronRight />
                </button>
              </div>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h3 className="step-title">
              <BsClock /> Izaberite termin
            </h3>
            {renderTimeSlots()}
          </>
        );
      case 5:
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
    
    if (step === 5) {
      if (!customerData.name || !customerData.phone || !customerData.email) {
        toast.error('Molimo popunite sva polja');
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/create_appointment.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            salonId: salonData.id,
            serviceId: selectedService,
            barberId: selectedBarber.id,
            date: selectedDate,
            timeSlot: selectedSlot,
            customerData
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Uspešno ste zakazali termin!');
          resetForm();
        } else {
          toast.error(data.error || 'Došlo je do greške prilikom zakazivanja');
        }
      } catch (error) {
        console.error('Greška:', error);
        toast.error('Greška pri komunikaciji sa serverom');
      }
    }
  };

  const resetForm = () => {
    setSelectedService(null);
    setSelectedDate('');
    setSelectedSlot('');
    setCustomerData({ name: '', phone: '', email: '' });
    setStep(1);
  };

  const renderButtons = () => {
    return (
      <div className="booking-nav">
        {step > 1 && (
          <button 
            type="button" 
            className="booking-btn-prev" 
            onClick={handlePrevStep}
          >
            Nazad
          </button>
        )}
        
        {step < 5 && (
          <button 
            type="button"
            className="booking-btn-next" 
            onClick={handleNextStep}
          >
            Dalje
          </button>
        )}
        
        {step === 5 && (
          <button 
            type="submit"
            className="booking-btn-next"
          >
            Zakaži termin
          </button>
        )}
      </div>
    );
  };

  const renderBarbers = () => {
    return (
      <>
        <h3 className="step-title">
          <BsPersonCircle /> Izaberite frizera
        </h3>
        <div className="booking-barbers">
          {barbers.length > 0 ? (
            barbers.map(barber => (
              <div
                key={barber.id}
                className={`booking-barber-card ${selectedBarber?.id === barber.id ? 'selected' : ''}`}
                onClick={() => setSelectedBarber(barber)}
              >
                <h4>{barber.ime} {barber.prezime}</h4>
                <div className="barber-details">
                  <span className="phone">{barber.telefon}</span>
                  <span className="email">{barber.email}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-barbers-message">
              Trenutno nema dostupnih frizera
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <nav className="booking-navbar">
        <Link to="/" className="booking-navbar-logo">
          MojFrizer <BsScissors className="navbar-scissors" />
        </Link>
      </nav>
      
      <div className="booking-wrapper">
        <Toaster position="top-right" />
        <div className="booking-main">
          <div className="booking-header">
            <h1>{salonData?.salonName}</h1>
            <p>{salonData?.address}, {salonData?.city}</p>
          </div>

          <div className="booking-progress">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className={`booking-step ${step >= num ? 'active' : ''}`}>
                {num}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {renderStepContent()}
            {renderButtons()}
          </form>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Booking;