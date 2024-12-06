import React, { useState, useEffect } from 'react';
import { BsClock, BsPause, BsToggleOn, BsToggleOff, BsCheck2Circle } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import './styles/BarberWorkingHours.css';

const BarberWorkingHours = ({ barberId, salonId }) => {
  const [workingHours, setWorkingHours] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const defaultDays = [
    { dayOfWeek: 1, name: 'Ponedeljak' },
    { dayOfWeek: 2, name: 'Utorak' },
    { dayOfWeek: 3, name: 'Sreda' },
    { dayOfWeek: 4, name: 'Četvrtak' },
    { dayOfWeek: 5, name: 'Petak' },
    { dayOfWeek: 6, name: 'Subota' },
    { dayOfWeek: 7, name: 'Nedelja' }
  ];

  useEffect(() => {
    if (barberId && salonId) {
      fetchWorkingHours();
    }
  }, [barberId, salonId]);

  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.0.31:8888/efrizer/php_api/get_working_hours.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: Number(barberId),
          salonId: Number(salonId)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const mappedHours = defaultDays.map(day => {
          const existingDay = data.workingHours.find(h => Number(h.dayOfWeek) === day.dayOfWeek);
          return existingDay ? {
            ...day,
            ...existingDay,
            isWorking: Boolean(existingDay.isWorking),
            hasBreak: Boolean(existingDay.hasBreak),
            startTime: existingDay.startTime || '09:00',
            endTime: existingDay.endTime || '17:00',
            breakStart: existingDay.breakStart || '12:00',
            breakEnd: existingDay.breakEnd || '13:00'
          } : {
            ...day,
            isWorking: false,
            startTime: '09:00',
            endTime: '17:00',
            hasBreak: false,
            breakStart: '12:00',
            breakEnd: '13:00'
          };
        });

        setWorkingHours(mappedHours);
      } else {
        throw new Error(data.error || 'Greška pri učitavanju podataka');
      }
    } catch (error) {
      console.error("Greška pri učitavanju:", error);
      toast.error('Greška pri učitavanju radnog vremena');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingChange = (dayOfWeek, isWorking) => {
    setWorkingHours(prev => {
      const updated = [...prev];
      const index = updated.findIndex(h => h.dayOfWeek === dayOfWeek);
      updated[index] = {
        ...updated[index],
        isWorking
      };
      return updated;
    });
  };

  const handleTimeChange = (dayOfWeek, field, value) => {
    setWorkingHours(prev => {
      const updated = [...prev];
      const index = updated.findIndex(h => h.dayOfWeek === dayOfWeek);
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const handleBreakChange = (dayOfWeek, hasBreak) => {
    setWorkingHours(prev => {
      const updated = [...prev];
      const index = updated.findIndex(h => h.dayOfWeek === dayOfWeek);
      updated[index] = {
        ...updated[index],
        hasBreak
      };
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://192.168.0.31:8888/efrizer/php_api/set_working_hours.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: Number(barberId),
          salonId: Number(salonId),
          workingHours: workingHours
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Nakon uspešnog čuvanja radnog vremena, generišemo termine
        const generateResponse = await fetch('http://192.168.0.31:8888/efrizer/php_api/generate_time_slots.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            barberId: Number(barberId),
            salonId: Number(salonId)
          })
        });

        const generateData = await generateResponse.json();
        
        if (generateData.success) {
          toast.success('Radno vreme je uspešno sačuvano i termini su generisani');
          setEditMode(false);
        } else {
          throw new Error(generateData.error);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Greška:", error);
      toast.error('Došlo je do greške pri čuvanju');
    }
  };

  if (!barberId || !salonId) {
    return <div>Nedostaju potrebni podaci</div>;
  }

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="working-hours-container">
      <div className="working-hours-header">
        <h2>Radno Vreme</h2>
        {!editMode && (
          <button className="edit-button" onClick={() => setEditMode(true)}>
            Izmeni
          </button>
        )}
      </div>

      <div className="days-grid">
        {defaultDays.map((defaultDay) => {
          const day = workingHours.find(h => h.dayOfWeek === defaultDay.dayOfWeek) || {
            dayOfWeek: defaultDay.dayOfWeek,
            isWorking: false,
            startTime: '09:00',
            endTime: '17:00',
            hasBreak: false,
            breakStart: '13:00',
            breakEnd: '14:00'
          };

          return (
            <div key={day.dayOfWeek} className="day-card">
              <div className="day-header">
                <span className="day-name">{defaultDay.name}</span>
                {editMode ? (
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id={`working-${day.dayOfWeek}`}
                      checked={day.isWorking}
                      onChange={(e) => handleWorkingChange(day.dayOfWeek, e.target.checked)}
                    />
                    <label htmlFor={`working-${day.dayOfWeek}`}>
                      {day.isWorking ? <BsToggleOn /> : <BsToggleOff />}
                    </label>
                  </div>
                ) : (
                  <span className={`status-badge ${day.isWorking ? 'active' : 'inactive'}`}>
                    {day.isWorking ? 'Otvoreno' : 'Zatvoreno'}
                  </span>
                )}
              </div>

              {day.isWorking && (
                <div className="time-settings">
                  <div className="time-group">
                    <BsClock className="time-icon" />
                    <div className="time-inputs">
                      {editMode ? (
                        <>
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                          />
                        </>
                      ) : (
                        <span className="time-display">{day.startTime} - {day.endTime}</span>
                      )}
                    </div>
                  </div>

                  {editMode && (
                    <div className="break-toggle">
                      <label className="break-label">
                        <input
                          type="checkbox"
                          checked={day.hasBreak}
                          onChange={(e) => handleBreakChange(day.dayOfWeek, e.target.checked)}
                        />
                        <span>Pauza</span>
                      </label>
                    </div>
                  )}

                  {day.hasBreak && (
                    <div className="break-time-group">
                      <BsPause className="break-icon" />
                      <div className="time-inputs">
                        {editMode ? (
                          <>
                            <input
                              type="time"
                              value={day.breakStart}
                              onChange={(e) => handleTimeChange(day.dayOfWeek, 'breakStart', e.target.value)}
                            />
                            <span>-</span>
                            <input
                              type="time"
                              value={day.breakEnd}
                              onChange={(e) => handleTimeChange(day.dayOfWeek, 'breakEnd', e.target.value)}
                            />
                          </>
                        ) : (
                          <span className="time-display">{day.breakStart} - {day.breakEnd}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editMode && (
        <div className="action-buttons">
          <button className="save-button" onClick={handleSave}>
            <BsCheck2Circle /> Sačuvaj
          </button>
          <button className="cancel-button" onClick={() => setEditMode(false)}>
            Otkaži
          </button>
        </div>
      )}
    </div>
  );
};

export default BarberWorkingHours; 