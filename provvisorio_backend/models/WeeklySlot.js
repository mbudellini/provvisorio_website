const mongoose = require('mongoose')

const SlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
})

const WeeklySlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
  },
  slots: [SlotSchema],
}, {
  timestamps: true,
})

// One document per day of week
WeeklySlotSchema.index({ dayOfWeek: 1 }, { unique: true })

const WeeklySlot = mongoose.model('WeeklySlot', WeeklySlotSchema)
module.exports = WeeklySlot