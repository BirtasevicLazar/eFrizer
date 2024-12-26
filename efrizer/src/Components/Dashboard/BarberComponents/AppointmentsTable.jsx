import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BsSearch, BsCheckCircle, BsXCircle, BsClock, BsPerson, BsTelephone, BsEnvelope, BsScissors, BsChevronLeft, BsChevronRight, BsX, BsCheck } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays, subDays, setHours, setMinutes } from 'date-fns';
import { sr } from 'date-fns/locale'; 
import './styles/AppointmentsTable.css';
import { API_BASE_URL } from '../../../config';

const AppointmentsTable = ({ salonId, barberId }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workingHours, setWorkingHours] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dohvatanje radnog vremena
  useEffect(() => {
    const fetchWorkingHours = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_barber_working_hours.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            salonId: Number(salonId),
            barberId: Number(barberId),
            date: format(selectedDate, 'yyyy-MM-dd')
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setWorkingHours(data.workingHours);
        }
      } catch (error) {
        console.error('Greška pri učitavanju radnog vremena:', error);
      }
    };

    if (barberId && salonId) {
      fetchWorkingHours();
    }
  }, [salonId, barberId, selectedDate]);

  // Generisanje vremenskih slotova na osnovu radnog vremena
  const generateTimeSlots = () => {
    if (!workingHours) return [];

    const dayOfWeek = selectedDate.getDay();
    const todayWorkingHours = workingHours.find(day => 
      day.day_of_week === (dayOfWeek === 0 ? 7 : dayOfWeek) && day.is_working
    );

    if (!todayWorkingHours) return [];

    const startTime = getMinutesFromTime(todayWorkingHours.start_time);
    const endTime = getMinutesFromTime(todayWorkingHours.end_time);
    const slots = [];

    for (let minutes = startTime; minutes < endTime; minutes += 15) {
      // Proveravamo pauzu ako postoji
      if (todayWorkingHours.has_break) {
        const breakStart = getMinutesFromTime(todayWorkingHours.break_start);
        const breakEnd = getMinutesFromTime(todayWorkingHours.break_end);
        if (minutes >= breakStart && minutes < breakEnd) {
          continue; // Preskačemo termine tokom pauze
        }
      }

      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      slots.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Funkcija za dohvatanje termina
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_appointments.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          salonId: Number(salonId),
          barberId: Number(barberId),
          date: format(selectedDate, 'yyyy-MM-dd')
        })
      });

      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Greška pri učitavanju termina:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Polling useEffect
  useEffect(() => {
    if (barberId && salonId) {
      fetchAppointments();
      const interval = setInterval(fetchAppointments, 10000);
      return () => clearInterval(interval);
    }
  }, [salonId, barberId, selectedDate]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update_appointment_status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          status: newStatus,
          salonId: salonId,
          date: format(selectedDate, 'yyyy-MM-dd')
        })
      });

      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
        toast.success('Status termina je uspešno ažuriran');
      }
    } catch (error) {
      console.error('Greška pri ažuriranju statusa:', error);
      toast.error('Došlo je do greške pri ažuriranju statusa');
    }
  };

  const CustomDatePicker = () => {
    return (
      <div className="ef-datepicker-wrapper">
        <input 
          type="date"
          value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="ef-datepicker-input"
        />
      </div>
    );
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed':
        return 'Završen';
      case 'cancelled':
        return 'Otkazan';
      case 'pending':
        return 'Na čekanju';
      default:
        return 'Nepoznat status';
    }
  };

  return (
    <div className="appointments-container">
      <div className="date-navigation">
        <button onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
          <BsChevronLeft /> <span>Prethodni dan</span>
        </button>
        <div className="current-date">
          <CustomDatePicker />
        </div>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          <span>Sledeći dan</span> <BsChevronRight />
        </button>
      </div>

      <div className="timeline-container">
        <div className="time-slots">
          {timeSlots.map((time) => (
            <div key={time} className="time-slot">
              {time}
            </div>
          ))}
        </div>

        <div className="appointments-timeline" style={{ height: `${timeSlots.length * 30}px` }}>
          {appointments.map((appointment) => {
            const startMinutes = getMinutesFromTime(appointment.time_slot);
            const duration = parseInt(appointment.duration);
            const dayStart = getMinutesFromTime(workingHours?.find(
              day => day.day_of_week === (selectedDate.getDay() === 0 ? 7 : selectedDate.getDay())
            )?.start_time || '08:00');
            
            const topPosition = ((startMinutes - dayStart) / 15) * 30;
            const height = (duration / 15) * 30;

            return (
              <div
                key={appointment.id}
                className={`appointment-item ${appointment.status}`}
                style={{
                  top: `${topPosition}px`,
                  height: `${height}px`
                }}
                onClick={() => handleAppointmentClick(appointment)}
              >
                <div className="appointment-info">
                  <div className="client-name">{appointment.client_name}</div>
                  <div className="service-name">{appointment.service_name}</div>
                  <div className="time-info">{appointment.time_slot}</div>
                </div>
                <div className="appointment-actions">
                  <button 
                    onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                    className="status-btn complete"
                  >
                    <BsCheckCircle />
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                    className="status-btn cancel"
                  >
                    <BsXCircle />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedAppointment && (
        <div className="ef-modal-overlay" onClick={handleCloseModal}>
          <div className="ef-modal-content" onClick={e => e.stopPropagation()}>
            <button className="ef-modal-close" onClick={handleCloseModal}>
              <BsX />
            </button>
            
            <div className="ef-modal-header">
              <h3>Detalji termina</h3>
            </div>
            
            <div className="ef-modal-body">
              <div className="ef-modal-info-group">
                <BsPerson className="ef-modal-icon" />
                <div>
                  <label>Klijent</label>
                  <p>{selectedAppointment.customer_name}</p>
                </div>
              </div>

              <div className="ef-modal-info-group">
                <BsScissors className="ef-modal-icon" />
                <div>
                  <label>Usluga</label>
                  <p>{selectedAppointment.service_name}</p>
                </div>
              </div>

              <div className="ef-modal-info-group">
                <BsClock className="ef-modal-icon" />
                <div>
                  <label>Vreme</label>
                  <p>{format(new Date(`${selectedAppointment.formatted_date} ${selectedAppointment.formatted_time}`), 'HH:mm')} ({selectedAppointment.duration} min)</p>
                </div>
              </div>

              <div className="ef-modal-info-group">
                <BsTelephone className="ef-modal-icon" />
                <div>
                  <label>Telefon</label>
                  <p>{selectedAppointment.customer_phone}</p>
                </div>
              </div>

              <div className="ef-modal-info-group">
                <BsEnvelope className="ef-modal-icon" />
                <div>
                  <label>Email</label>
                  <p>{selectedAppointment.customer_email}</p>
                </div>
              </div>

              <div className="ef-modal-status">
                <label>Status</label>
                <span className={`ef-status-badge ${selectedAppointment.status}`}>
                  {getStatusText(selectedAppointment.status)}
                </span>
              </div>
            </div>
            
            <div className="ef-modal-actions">
              <button 
                onClick={() => handleStatusUpdate(selectedAppointment.id, 'completed')}
                className="ef-btn ef-btn-success"
              >
                <BsCheckCircle /> Završi
              </button>
              <button 
                onClick={() => handleStatusUpdate(selectedAppointment.id, 'cancelled')}
                className="ef-btn ef-btn-danger"
              >
                <BsXCircle /> Otkaži
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper funkcija za konvertovanje vremena u minute
const getMinutesFromTime = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export default AppointmentsTable;