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

const Collezione = mongoose.model('Collezione', CollectionSchema)
module.exports = Collezione