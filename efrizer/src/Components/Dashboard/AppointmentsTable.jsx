import React, { useState, useEffect } from 'react';
import { BsSearch, BsFilter, BsCheckCircle, BsXCircle, BsClock } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import './AppointmentsTable.css';

const AppointmentsTable = ({ salonId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateStr) => {
    const months = [
      'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
      'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
    ];
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}. ${month} ${year}.`;
  };

  useEffect(() => {
    fetchAppointments();
  }, [salonId]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://192.168.0.27:8888/efrizer/php_api/get_appointments.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salonId })
      });

      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Greška:', error);
      toast.error('Greška pri učitavanju termina');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await fetch('http://192.168.0.27:8888/efrizer/php_api/update_appointment_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          appointmentId,
          status: newStatus 
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Status termina je uspešno ažuriran');
        fetchAppointments(); // Osvežavamo listu
      } else {
        toast.error(data.error || 'Greška pri ažuriranju statusa');
      }
    } catch (error) {
      console.error('Greška:', error);
      toast.error('Greška pri komunikaciji sa serverom');
    }
  };

  const filteredAppointments = appointments
    .filter(appointment => {
      if (filter !== 'all' && appointment.status !== filter) return false;
      
      const searchString = `${appointment.customer_name} ${appointment.customer_phone} ${appointment.customer_email} ${appointment.service_name}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.formatted_date} ${a.formatted_time}`);
      const dateB = new Date(`${b.formatted_date} ${b.formatted_time}`);
      return dateB - dateA;
    });

  if (loading) {
    return <div className="loading-spinner">Učitavanje...</div>;
  }

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <div className="search-bar">
          <BsSearch />
          <input
            type="text"
            placeholder="Pretraži po imenu, telefonu ili usluzi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <BsFilter />
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Svi termini
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Na čekanju
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Završeni
          </button>
          <button 
            className={filter === 'cancelled' ? 'active' : ''} 
            onClick={() => setFilter('cancelled')}
          >
            Otkazani
          </button>
        </div>
      </div>

      <div className="appointments-table-wrapper">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Datum i vreme</th>
              <th>Klijent</th>
              <th>Kontakt</th>
              <th>Usluga</th>
              <th>Status</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map(appointment => (
              <tr key={appointment.id}>
                <td>
                  <div className="date-time">
                    <span className="date">
                      {formatDate(appointment.formatted_date)}
                    </span>
                    <span className="time">{appointment.formatted_time}</span>
                  </div>
                </td>
                <td>{appointment.customer_name}</td>
                <td>
                  <div className="contact-info">
                    <span>{appointment.customer_phone}</span>
                    <span>{appointment.customer_email}</span>
                  </div>
                </td>
                <td>{appointment.service_name}</td>
                <td>
                  <span className={`status-badge ${appointment.status}`}>
                    {appointment.status === 'pending' ? <BsClock /> : 
                     appointment.status === 'completed' ? <BsCheckCircle /> : 
                     <BsXCircle />}
                    {appointment.status === 'pending' ? 'Na čekanju' : 
                     appointment.status === 'completed' ? 'Završen' : 
                     'Otkazan'}
                  </span>
                </td>
                <td>
                  <div className="appointment-actions">
                    {appointment.status === 'pending' && (
                      <>
                        <button 
                          className="action-btn complete"
                          onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                        >
                          Završi
                        </button>
                        <button 
                          className="action-btn cancel"
                          onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                        >
                          Otkaži
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentsTable;