const router = require('express').Router()
const controller = require('../controllers/upload')
const auth = require('../middleware/auth')
const multer = require('multer')

// Usa memory storage per ricevere il file come buffer
// Limite 4MB per compatibilità con Vercel Serverless Functions (max 4.5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
})

router.post('/', auth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ ok: false, message: 'File troppo grande. Massimo 4MB.' })
      }
      return res.status(400).json({ ok: false, message: err.message })
    }
    next()
  })
}, controller.uploadImage)
router.delete('/', auth, controller.deleteImage)

module.exports = router