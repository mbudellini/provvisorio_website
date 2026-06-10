const Appointment = require('../models/Appointment')
const WeeklySlot = require('../models/WeeklySlot')

// POST /appointments — public: create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { firstName, lastName, email, appointmentDate, slotStartTime, slotEndTime } = req.body

    if (!firstName || !lastName || !email || !appointmentDate || !slotStartTime || !slotEndTime) {
      return res.status(400).json({ error: 'Tutti i campi sono obbligatori' })
    }

    // Check if the slot is already booked
    const date = new Date(appointmentDate)
    const existing = await Appointment.findOne({
      appointmentDate: date,
      slotStartTime,
      slotEndTime,
      status: { $ne: 'cancelled' },
    })

    if (existing) {
      return res.status(409).json({ error: 'Questo slot è già stato prenotato' })
    }

    const appointment = await Appointment.create({
      firstName,
      lastName,
      email,
      appointmentDate: date,
      slotStartTime,
      slotEndTime,
      status: 'confirmed',
    })

    res.status(201).json(appointment)
  } catch (err) {
    console.error('Error creating appointment:', err)
    res.status(500).json({ error: 'Errore nella creazione della prenotazione' })
  }
}

// GET /appointments — admin: get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const { status, from, to } = req.query

    const filter = {}
    if (status) filter.status = status
    if (from || to) {
      filter.appointmentDate = {}
      if (from) filter.appointmentDate.$gte = new Date(from)
      if (to) filter.appointmentDate.$lte = new Date(to)
    }

    const appointments = await Appointment.find(filter).sort({ appointmentDate: 1 })
    res.json(appointments)
  } catch (err) {
    console.error('Error fetching appointments:', err)
    res.status(500).json({ error: 'Errore nel recupero delle prenotazioni' })
  }
}

// PUT /appointments/:id/status — admin: update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['confirmed', 'cancelled', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Stato non valido' })
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )

    if (!appointment) {
      return res.status(404).json({ error: 'Prenotazione non trovata' })
    }

    res.json(appointment)
  } catch (err) {
    console.error('Error updating appointment:', err)
    res.status(500).json({ error: 'Errore nell\'aggiornamento della prenotazione' })
  }
}

// DELETE /appointments/:id — admin: delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params
    const appointment = await Appointment.findByIdAndDelete(id)

    if (!appointment) {
      return res.status(404).json({ error: 'Prenotazione non trovata' })
    }

    res.json({ message: 'Prenotazione eliminata' })
  } catch (err) {
    console.error('Error deleting appointment:', err)
    res.status(500).json({ error: 'Errore nell\'eliminazione della prenotazione' })
  }
}

// GET /appointments/available-slots — public: get available slots for a date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query
    console.log('[DEBUG getAvailableSlots] Query date:', date)

    if (!date) {
      return res.status(400).json({ error: 'Parametro data obbligatorio (YYYY-MM-DD)' })
    }

    // Parse date as UTC to get correct day of week regardless of server timezone
    const requestedDate = new Date(date + 'T00:00:00Z')
    const dayOfWeek = requestedDate.getUTCDay()
    console.log('[DEBUG getAvailableSlots] Parsed date (UTC):', requestedDate.toISOString())
    console.log('[DEBUG getAvailableSlots] Day of week:', dayOfWeek, '(0=Dom, 1=Lun, ..., 6=Sab)')

    // Get weekly slot config for this day
    const weeklySlot = await WeeklySlot.findOne({ dayOfWeek })
    console.log('[DEBUG getAvailableSlots] WeeklySlot found:', weeklySlot ? JSON.stringify(weeklySlot, null, 2) : 'NULL')

    if (!weeklySlot || weeklySlot.slots.length === 0) {
      console.log('[DEBUG getAvailableSlots] No weeklySlot or empty slots, returning []')
      return res.json([])
    }

    // Get active slots
    const activeSlots = weeklySlot.slots.filter((s) => s.isActive)
    console.log('[DEBUG getAvailableSlots] Active slots:', JSON.stringify(activeSlots))

    if (activeSlots.length === 0) {
      console.log('[DEBUG getAvailableSlots] No active slots, returning []')
      return res.json([])
    }

    // Check which slots are already booked
    const startOfDay = new Date(date + 'T00:00:00Z')
    const endOfDay = new Date(date + 'T23:59:59.999Z')
    console.log('[DEBUG getAvailableSlots] Searching appointments between:', startOfDay.toISOString(), 'and', endOfDay.toISOString())

    const bookedAppointments = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' },
    })
    console.log('[DEBUG getAvailableSlots] Booked appointments:', bookedAppointments.length)

    const bookedKeys = new Set(
      bookedAppointments.map((a) => `${a.slotStartTime}-${a.slotEndTime}`)
    )

    const availableSlots = activeSlots.filter(
      (s) => !bookedKeys.has(`${s.startTime}-${s.endTime}`)
    )
    console.log('[DEBUG getAvailableSlots] Available slots to return:', JSON.stringify(availableSlots))

    res.json(availableSlots)
  } catch (err) {
    console.error('Error fetching available slots:', err)
    res.status(500).json({ error: 'Errore nel recupero degli slot disponibili' })
  }
}
