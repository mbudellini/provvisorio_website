const Product = require('../models/Product')
const Category = require('../models/Category')

const getAll = async (req, res) => {
  try {
    const filter = {}
    if (req.query.collezione) {
      // Support filtering by collection slug or ObjectId
      const Collezione = require('../models/Collezione')
      const col = await Collezione.findOne({
        $or: [
          { _id: req.query.collezione.match(/^[0-9a-fA-F]{24}$/) ? req.query.collezione : null },
          { slug: req.query.collezione }
        ]
      })
      if (col) {
        filter.collezione = col._id
      } else {
        return res.json([])
      }
    }
    if (req.query.gender) filter.gender = req.query.gender
    if (req.query.category) {
      // Support filtering by category slug (find the ObjectId first)
      const cat = await Category.findOne({
        $or: [
          { _id: req.query.category.match(/^[0-9a-fA-F]{24}$/) ? req.query.category : null },
          { slug: req.query.category }
        ]
      })
      if (cat) {
        filter.category = cat._id
      } else {
        return res.json([])
      }
    }
    const products = await Product.find(filter)
      .populate('collezione')
      .populate('category')
      .sort({ order: 1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

const getBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('collezione')
      .populate('category')
    if (!product) return res.status(404).json({ ok: false, message: 'Prodotto non trovato' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

const create = async (req, res) => {
  try {
    const product = new Product(req.body)
    const saved = await product.save()
    const populated = await Product.findById(saved._id).populate('collezione').populate('category')
    res.status(201).json(populated)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, message: 'Slug già esistente' })
    }
    res.status(400).json({ ok: false, message: err.message })
  }
}

const update = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('collezione')
      .populate('category')
    if (!updated) return res.status(404).json({ ok: false, message: 'Prodotto non trovato' })
    res.json(updated)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, message: 'Slug già esistente' })
    }
    res.status(400).json({ ok: false, message: err.message })
  }
}

const remove = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ ok: false, message: 'Prodotto non trovato' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

module.exports = { getAll, getBySlug, create, update, remove }