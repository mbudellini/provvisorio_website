const express = require('express')
const cors = require('cors')

const app = express()

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

// Routes (mounted under /api for Vercel serverless)
app.use('/api/auth', require('./routes/auth'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/collections', require('./routes/collections'))
app.use('/api/products', require('./routes/products'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/hero-images', require('./routes/heroImages'))
app.use('/api/weekly-slots', require('./routes/weeklySlots'))
app.use('/api/appointments', require('./routes/appointments'))

module.exports = app
