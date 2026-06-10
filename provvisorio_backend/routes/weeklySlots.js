const express = require('express')
const router = express.Router()
const { getWeeklySlots, updateWeeklySlots, updateDaySlots } = require('../controllers/weeklySlots')
const verifyToken = require('../middleware/auth')

// Public
router.get('/', getWeeklySlots)

// Admin only
router.put('/', verifyToken, updateWeeklySlots)
router.put('/:dayOfWeek', verifyToken, updateDaySlots)

module.exports = router