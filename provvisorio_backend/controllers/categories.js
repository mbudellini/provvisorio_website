const Category = require('../models/Category')

const getAll = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 })
    res.json(categories)
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

const getBySlug = async (req, res) => {
  try {
    const rawSlug = req.params.slug.trim()
    const slugVariants = [
      rawSlug,
      rawSlug.replace(/-/g, ' '),
      rawSlug.replace(/-/g, ' ').toLowerCase(),
    ]
    let category = null
    for (const variant of slugVariants) {
      category = await Category.findOne({ slug: { $regex: new RegExp(`^\\s*${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') } })
      if (category) break
    }
    if (!category) return res.status(404).json({ ok: false, message: 'Categoria non trovata' })
    res.json(category)
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

const create = async (req, res) => {
  try {
    const category = new Category(req.body)
    const saved = await category.save()
    res.status(201).json(saved)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, message: 'Slug o nome già esistente' })
    }
    res.status(400).json({ ok: false, message: err.message })
  }
}

const update = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ ok: false, message: 'Categoria non trovata' })
    res.json(updated)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, message: 'Slug o nome già esistente' })
    }
    res.status(400).json({ ok: false, message: err.message })
  }
}

const remove = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ ok: false, message: 'Categoria non trovata' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

module.exports = { getAll, getBySlug, create, update, remove }