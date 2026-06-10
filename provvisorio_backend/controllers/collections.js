const Collezione = require('../models/Collezione')

const getAll = async (req, res) => {
  try {
    const collections = await Collezione.find().sort({ order: 1 })
    res.json(collections)
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

const getBySlug = async (req, res) => {
  try {
    const collection = await Collezione.findOne({ slug: req.params.slug })
    if (!collection) return res.status(404).json({ ok: false, message: 'Collezione non trovata' })
    res.json(collection)
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

const create = async (req, res) => {
  try {
    const collection = new Collezione(req.body)
    const saved = await collection.save()
    res.status(201).json(saved)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, message: 'Slug già esistente' })
    }
    res.status(400).json({ ok: false, message: err.message })
  }
}

const update = async (req, res) => {
  try {
    const updated = await Collezione.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!updated) return res.status(404).json({ ok: false, message: 'Collezione non trovata' })
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
    const deleted = await Collezione.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ ok: false, message: 'Collezione non trovata' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

module.exports = { getAll, getBySlug, create, update, remove }