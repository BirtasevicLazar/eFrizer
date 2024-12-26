import React, { useState, useEffect } from 'react';
import { BsPlus, BsPencil, BsTrash, BsCheck, BsX } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import './styles/BarberServices.css';
import { API_BASE_URL } from '../../../config'; // Dodajte ovaj import

const BarberServices = ({ barberId, salonId }) => {
  const [services, setServices] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: '30',
    price: '',
    description: ''
  });

  const durationOptions = [15, 30, 45, 60, 75, 90, 105, 120];

  useEffect(() => {
    fetchServices();
  }, [barberId]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_barber_services.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId, salonId })
      });

      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      toast.error('Greška pri učitavanju usluga');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingService 
        ? 'update_barber_service.php'
        : 'add_barber_service.php';

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          barberId,
          salonId,
          serviceId: editingService?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingService ? 'Usluga uspešno izmenjena' : 'Usluga uspešno dodata');
        setShowAddForm(false);
        setEditingService(null);
        setFormData({ name: '', duration: '30', price: '', description: '' });
        fetchServices();
      }
    } catch (error) {
      toast.error(editingService ? 'Greška pri izmeni usluge' : 'Greška pri dodavanju usluge');
    }
  };

  const handleDelete = async (serviceId) => {
    try {
      // Prvo proveravamo da li ima zakazanih termina
      const checkResponse = await fetch(`${API_BASE_URL}/delete_barber_service.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          barberId,
          salonId,
          checkOnly: true // Dodajemo novi parametar za proveru
        })
      });

      const checkData = await checkResponse.json();
      
      if (!checkData.success && checkData.hasAppointments) {
        // Ako ima termina, pitamo za potvrdu
        if (window.confirm(checkData.error)) {
          // Ako korisnik potvrdi, brišemo sve
          const deleteResponse = await fetch(`${API_BASE_URL}/delete_barber_service.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId,
              barberId,
              salonId,
              confirmed: true
            })
          });

          const deleteData = await deleteResponse.json();
          if (deleteData.success) {
            toast.success('Usluga i povezani termini su uspešno obrisani');
            fetchServices();
          }
        }
      } else if (checkData.success) {
        // Ako nema termina, samo brišemo uslugu
        toast.success('Usluga uspešno obrisana');
        fetchServices();
      }
    } catch (error) {
      toast.error('Greška pri brisanju usluge');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.naziv_usluge,
      duration: service.trajanje,
      price: service.cena,
      description: service.opis || ''
    });
    setShowAddForm(true);
  };

  return (
    <div className="barber-services">
      <div className="services-header">
        <h4>Usluge</h4>
        {!showAddForm && (
          <button className="add-service-btn" onClick={() => setShowAddForm(true)}>
            <BsPlus /> Dodaj uslugu
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="service-form">
          <input
            type="text"
            placeholder="Naziv usluge"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <select
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
            required
          >
            <option value="">Izaberite trajanje</option>
            {durationOptions.map(duration => (
              <option key={duration} value={duration}>
                {duration} minuta
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Cena"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
          />
          <textarea
            placeholder="Opis usluge"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="3"
          />
          <div className="form-actions">
            <button type="submit" className="save-button">
              <BsCheck /> {editingService ? 'Sačuvaj izmene' : 'Dodaj'}
            </button>
            <button 
              type="button" 
              className="cancel-button" 
              onClick={() => {
                setShowAddForm(false);
                setEditingService(null);
                setFormData({ name: '', duration: '30', price: '', description: '' });
              }}
            >
              <BsX /> Otkaži
            </button>
          </div>
        </form>
      )}

      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-info">
              <h5>{service.naziv_usluge}</h5>
              <p>{service.trajanje} min | {service.cena} {service.valuta || 'RSD'}</p>
              {service.opis && <p className="service-description">{service.opis}</p>}
            </div>
            <div className="service-actions">
              <button 
                className="edit-btn"
                onClick={() => handleEdit(service)}
              >
                <BsPencil />
              </button>
              <button 
                className="delete-btn"
                onClick={() => handleDelete(service.id)}
              >
                <BsTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarberServices;