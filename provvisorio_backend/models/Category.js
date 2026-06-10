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

// Auto-trim and clean slug before saving
CategorySchema.pre('save', function() {
  if (this.slug) {
    this.slug = this.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-')
  }
  if (this.name) {
    this.name = this.name.trim()
  }
})

const Category = mongoose.model('Category', CategorySchema)
module.exports = Category