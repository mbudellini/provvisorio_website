const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
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
  price: {
    type: Number,
    default: 0,
  },
  images: [{
    type: String,
  }],
  collezione: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collezione',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  sizes: [{
    type: String,
  }],
  colors: [{
    type: String,
  }],
  gender: {
    type: String,
    enum: ['uomo', 'donna'],
    default: 'uomo',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

const Product = mongoose.model('Product', ProductSchema)
module.exports = Product