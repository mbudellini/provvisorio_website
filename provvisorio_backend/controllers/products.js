const Product = require('../models/Product')
const Category = require('../models/Category')

  const getAll = async (req, res) => {
  try {
    const filter = {}
    if (req.query.collezione) {
      const val = req.query.collezione.trim()
      if (val.match(/^[0-9a-fA-F]{24}$/)) {
        // ObjectId passato direttamente dal frontend — usalo come filtro
        filter.collezione = val
      } else {
        // È uno slug — cerca la collezione corrispondente
        const Collezione = require('../models/Collezione')
        let col = await Collezione.findOne({ slug: val })
        if (!col) {
          const escaped = val.replace(/-/g, ' ').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          col = await Collezione.findOne({ slug: { $regex: new RegExp(`^\\s*${escaped}\\s*$`, 'i') } })
        }
        if (col) {
          filter.collezione = col._id
        } else {
          return res.json([])
        }
      }
    }
    if (req.query.gender) filter.gender = req.query.gender
    if (req.query.category) {
      const val = req.query.category.trim()
      if (val.match(/^[0-9a-fA-F]{24}$/)) {
        // ObjectId passato direttamente dal frontend — usalo come filtro
        filter.category = val
      } else {
        // È uno slug — cerca la categoria corrispondente
        let cat = await Category.findOne({ slug: val })
        if (!cat) {
          const escaped = val.replace(/-/g, ' ').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          cat = await Category.findOne({ slug: { $regex: new RegExp(`^\\s*${escaped}\\s*$`, 'i') } })
        }
        if (cat) {
          filter.category = cat._id
        } else {
          return res.json([])
        }
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