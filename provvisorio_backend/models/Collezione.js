const mongoose = require('mongoose')

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  coverImage: {
    type: String,
    default: '',
  },
  season: {
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
CollectionSchema.pre('save', function(next) {
  if (this.slug) {
    this.slug = this.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-')
  }
  if (this.name) {
    this.name = this.name.trim()
  }
  next()
})

const Collezione = mongoose.model('Collezione', CollectionSchema)
module.exports = Collezione