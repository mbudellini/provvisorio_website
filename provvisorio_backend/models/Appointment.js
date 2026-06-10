const mongoose = require('mongoose')

const AppointmentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  slotStartTime: {
    type: String,
    required: true,
  },
  slotEndTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
})

const Appointment = mongoose.model('Appointment', AppointmentSchema)
module.exports = Appointment