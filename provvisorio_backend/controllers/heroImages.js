const HeroImage = require('../models/HeroImage')
const cloudinary = require('../config/cloudinary')

const getHeroImages = async (req, res) => {
  try {
    const images = await HeroImage.find().sort({ createdAt: 1 })
    res.json(images)
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

const addHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'Nessun file caricato' })
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'provvisorio/hero',
          allowed_formats: ['jpg', 'png', 'webp'],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(req.file.buffer)
    })

    const heroImage = await HeroImage.create({
      url: result.secure_url,
      publicId: result.public_id,
    })

    res.json({ ok: true, image: heroImage })
  } catch (err) {
    console.error('Hero image upload error:', err)
    res.status(500).json({ ok: false, message: err.message || 'Errore upload' })
  }
}

const deleteHeroImage = async (req, res) => {
  try {
    const { id } = req.params
    const heroImage = await HeroImage.findById(id)
    if (!heroImage) {
      return res.status(404).json({ ok: false, message: 'Immagine non trovata' })
    }

    await cloudinary.uploader.destroy(heroImage.publicId)
    await heroImage.deleteOne()

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

module.exports = { getHeroImages, addHeroImage, deleteHeroImage }