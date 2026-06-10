const express = require('express')
const router = express.Router()
const {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getAvailableSlots,
} = require('../controllers/appointments')
const verifyToken = require('../middleware/auth')

// Public
router.post('/', createAppointment)
router.get('/available-slots', getAvailableSlots)

// Admin only
router.get('/', verifyToken, getAppointments)
router.put('/:id/status', verifyToken, updateAppointmentStatus)
router.delete('/:id', verifyToken, deleteAppointment)

module.exports = router