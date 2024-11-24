import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BsSearch, BsCheckCircle, BsXCircle, BsClock, BsPerson, BsTelephone, BsEnvelope, BsScissors, BsChevronLeft, BsChevronRight, BsX, BsCheck } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import { format, addDays, subDays, setHours, setMinutes } from 'date-fns';
import { sr } from 'date-fns/locale';
import './AppointmentsTable.css';

const AppointmentsTable = ({ salonId }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workingHours, setWorkingHours] = useState(null);

  // Dohvatanje radnog vremena
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
        if (data.success) {
          setWorkingHours(data.working_hours);
        }
      } catch (error) {
        console.error('Greška pri učitavanju radnog vremena:', error);
      }
    };

    fetchWorkingHours();
  }, [salonId]);

  // Generisanje vremenskih slotova na osnovu radnog vremena
  const generateTimeSlots = () => {
    if (!workingHours) return [];

    const dayOfWeek = selectedDate.getDay();
    const todayWorkingHours = workingHours.find(day => day.day_of_week === (dayOfWeek === 0 ? 7 : dayOfWeek));

    if (!todayWorkingHours || !todayWorkingHours.is_working) return [];

    const startTime = getMinutesFromTime(todayWorkingHours.start_time);
    const endTime = getMinutesFromTime(todayWorkingHours.end_time);
    const slots = [];

    for (let minutes = startTime; minutes < endTime; minutes += 15) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      slots.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Polling za real-time ažuriranje
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://192.168.0.27:8888/efrizer/php_api/get_appointments.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            salonId: salonId,
            date: format(selectedDate, 'yyyy-MM-dd')
          })
        });

        const data = await response.json();
        if (data.success) {
          setAppointments(data.appointments);
        }
      } catch (error) {
        console.error('Greška pri učitavanju termina:', error);
      }
    };

    fetchAppointments();
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, [salonId, selectedDate]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await fetch('http://192.168.0.27:8888/efrizer/php_api/update_appointment_status.php', {
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

  return (
    <div className="appointments-container">
      <div className="date-navigation">
        <button onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
          <BsChevronLeft /> Prethodni dan
        </button>
        <div className="current-date">
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            dateFormat="EEEE, d. MMMM yyyy."
            locale={sr}
            className="date-picker"
          />
        </div>
        <button onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
          Sledeći dan <BsChevronRight />
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
    </div>
  );
};

// Helper funkcija za konvertovanje vremena u minute
const getMinutesFromTime = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export default AppointmentsTable;