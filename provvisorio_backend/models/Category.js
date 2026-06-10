const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

const Category = mongoose.model('Category', CategorySchema)
module.exports = Category