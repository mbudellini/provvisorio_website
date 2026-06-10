import { useState, useEffect } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { it } from 'date-fns/locale/it'
import api from '../api'

export default function AppointmentBooking() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [weeklyConfig, setWeeklyConfig] = useState([])
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Fetch weekly slot configuration
  useEffect(() => {
    api.get('/weekly-slots')
      .then((res) => {
        console.log('[DEBUG Booking] Weekly config received:', JSON.stringify(res.data, null, 2))
        setWeeklyConfig(res.data)
      })
      .catch((err) => {
        console.error('[DEBUG Booking] Error fetching weekly slots:', err)
      })
  }, [])

  // Determine which days have slots
  const daysWithSlots = new Set(
    weeklyConfig
      .filter((day) => day.slots.some((s) => s.isActive))
      .map((day) => day.dayOfWeek)
  )
  console.log('[DEBUG Booking] daysWithSlots:', [...daysWithSlots], '(0=Dom, 1=Lun, ..., 6=Sab)')

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      setSelectedSlot(null)
      return
    }

    setLoading(true)
    // Format date in local timezone to avoid UTC offset issues
    const dateStr = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, '0'),
      String(selectedDate.getDate()).padStart(2, '0'),
    ].join('-')
    console.log('[DEBUG Booking] Fetching slots for date:', dateStr, '(local)')

    api.get(`/appointments/available-slots?date=${dateStr}`)
      .then((res) => {
        setAvailableSlots(res.data)
        setSelectedSlot(null)
      })
      .catch(() => {
        setAvailableSlots([])
        setSelectedSlot(null)
      })
      .finally(() => setLoading(false))
  }, [selectedDate])

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setError('')
    setSuccess(false)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedDate || !selectedSlot) {
      setError('Seleziona una data e un orario')
      return
    }
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError('Compila tutti i campi')
      return
    }

    setSubmitting(true)
    // Format date in local timezone to avoid UTC offset issues
    const dateStr = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, '0'),
      String(selectedDate.getDate()).padStart(2, '0'),
    ].join('-')

    try {
      await api.post('/appointments', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        appointmentDate: dateStr,
        slotStartTime: selectedSlot.startTime,
        slotEndTime: selectedSlot.endTime,
      })

      setSuccess(true)
      setFormData({ firstName: '', lastName: '', email: '' })
      setSelectedSlot(null)
      setAvailableSlots([])
      setSelectedDate(null)
    } catch (err) {
      const msg = err.response?.data?.error || 'Errore nella prenotazione. Riprova.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Disable dates that don't have slots or are in the past
  const shouldDisableDate = (date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return true
    return !daysWithSlots.has(date.getDay())
  }

  const formatDate = (date) => {
    if (!date) return ''
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <section id="booking-section" className="booking-section">
      <h2 className="section-title">Prenota un Appuntamento</h2>
      <p className="booking-subtitle">Scegli una data e un orario per prenotare la tua visita</p>

      {success && (
        <div className="booking-success">
          Prenotazione effettuata con successo! Ti aspettiamo.
        </div>
      )}

      {error && (
        <div className="booking-error">
          {error}
        </div>
      )}

      <div className="booking-container">
        {/* Calendar */}
        <div className="booking-calendar-wrapper">
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
            <DateCalendar
              value={selectedDate}
              onChange={handleDateChange}
              shouldDisableDate={shouldDisableDate}
              disablePast
              sx={{
                '& .MuiPickersDay-root': {
                  fontSize: '0.9rem',
                },
                '& .MuiDayCalendar-headerDay': {
                  fontSize: '0.8rem',
                },
              }}
            />
          </LocalizationProvider>
        </div>

        {/* Slots & Form */}
        <div className="booking-form-wrapper">
          {selectedDate && (
            <>
              <h3 className="booking-date-label">
                {formatDate(selectedDate)}
              </h3>

              {loading ? (
                <p className="booking-loading">Caricamento orari...</p>
              ) : availableSlots.length > 0 ? (
                <div className="booking-slots">
                  <p className="booking-slots-label">Orari disponibili:</p>
                  <div className="booking-slots-grid">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        className={`booking-slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                        type="button"
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="booking-no-slots">Nessun orario disponibile per questa data</p>
              )}

              {selectedSlot && (
                <form className="booking-form" onSubmit={handleSubmit}>
                  <h4 className="booking-form-title">I tuoi dati</h4>
                  <div className="booking-form-group">
                    <label htmlFor="firstName">Nome</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Il tuo nome"
                      required
                    />
                  </div>
                  <div className="booking-form-group">
                    <label htmlFor="lastName">Cognome</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Il tuo cognome"
                      required
                    />
                  </div>
                  <div className="booking-form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="La tua email"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="booking-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Prenotazione in corso...' : 'Conferma Prenotazione'}
                  </button>
                </form>
              )}
            </>
          )}

          {!selectedDate && (
            <div className="booking-placeholder">
              <span className="booking-placeholder-icon"></span>
              <p>Seleziona una data dal calendario per vedere gli orari disponibili</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}