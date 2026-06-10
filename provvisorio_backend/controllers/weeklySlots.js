const WeeklySlot = require('../models/WeeklySlot')

// GET /weekly-slots — public: get all weekly slot configurations
exports.getWeeklySlots = async (req, res) => {
  try {
    const slots = await WeeklySlot.find().sort({ dayOfWeek: 1 })
    res.json(slots)
  } catch (err) {
    console.error('Error fetching weekly slots:', err)
    res.status(500).json({ error: 'Errore nel recupero degli slot settimanali' })
  }
}

// PUT /weekly-slots — admin: update all weekly slot configurations
exports.updateWeeklySlots = async (req, res) => {
  try {
    const { weeklySlots } = req.body
    console.log('[DEBUG updateWeeklySlots] Received:', JSON.stringify(weeklySlots, null, 2))

    if (!Array.isArray(weeklySlots)) {
      return res.status(400).json({ error: 'Formato dati non valido' })
    }

    // Get all dayOfWeek values being updated
    const updatedDays = weeklySlots.map((d) => d.dayOfWeek)

    // Delete days NOT in the update (disabled days)
    const deleteResult = await WeeklySlot.deleteMany({
      dayOfWeek: { $nin: updatedDays },
    })
    console.log('[DEBUG updateWeeklySlots] Deleted disabled days:', deleteResult.deletedCount)

    const results = []

    for (const dayConfig of weeklySlots) {
      const { dayOfWeek, slots } = dayConfig

      if (dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({ error: `Giorno non valido: ${dayOfWeek}` })
      }

      const slotData = slots.map((s) => ({
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: s.isActive !== false,
      }))
      console.log(`[DEBUG updateWeeklySlots] Saving day ${dayOfWeek}:`, JSON.stringify(slotData))

      const updated = await WeeklySlot.findOneAndUpdate(
        { dayOfWeek },
        {
          dayOfWeek,
          slots: slotData,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )

      results.push(updated)
    }

    console.log('[DEBUG updateWeeklySlots] Save complete, returning:', results.length, 'days')
    res.json(results)
  } catch (err) {
    console.error('Error updating weekly slots:', err)
    res.status(500).json({ error: 'Errore nell\'aggiornamento degli slot settimanali' })
  }
}

// PUT /weekly-slots/:dayOfWeek — admin: update a single day
exports.updateDaySlots = async (req, res) => {
  try {
    const { dayOfWeek } = req.params
    const { slots } = req.body

    const day = parseInt(dayOfWeek)
    if (day < 0 || day > 6) {
      return res.status(400).json({ error: 'Giorno non valido' })
    }

    const updated = await WeeklySlot.findOneAndUpdate(
      { dayOfWeek: day },
      {
        dayOfWeek: day,
        slots: slots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive !== false,
        })),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    res.json(updated)
  } catch (err) {
    console.error('Error updating day slots:', err)
    res.status(500).json({ error: 'Errore nell\'aggiornamento degli slot' })
  }
}