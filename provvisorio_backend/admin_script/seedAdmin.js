require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const mongoose = require('mongoose')
const Admin = require('../models/Admin')

const username = process.argv[2] || 'admin'
const password = process.argv[3] || 'admin123'

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO)
    console.log('Connected to the DB')

    // Check if admin already exists
    const existing = await Admin.findOne({ username })
    if (existing) {
      console.log(`⚠️  Admin "${username}" already exists!`)
      process.exit(0)
    }

    // Create new admin
    const admin = new Admin({ username, password })
    await admin.save()

    console.log(`✅ Admin created successfully!`)
    console.log(`   Username: ${username}`)
    console.log(`   Password: ${password}`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    process.exit(1)
  }
}

seedAdmin()