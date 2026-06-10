const cloudinary = require('../config/cloudinary')

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'Nessun file caricato' })
    }

    // Upload diretto a Cloudinary dal buffer in memoria
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'provvisorio',
          allowed_formats: ['jpg', 'png', 'webp'],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(req.file.buffer)
    })

    res.json({
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ ok: false, message: err.message || 'Errore upload' })
  }
}

const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body
    if (!publicId) {
      return res.status(400).json({ ok: false, message: 'publicId richiesto' })
    }
    const result = await cloudinary.uploader.destroy(publicId)
    res.json({ ok: true, result })
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message })
  }
}

module.exports = { uploadImage, deleteImage }