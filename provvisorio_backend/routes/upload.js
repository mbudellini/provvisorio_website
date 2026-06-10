const router = require('express').Router()
const controller = require('../controllers/upload')
const auth = require('../middleware/auth')
const multer = require('multer')

// Usa memory storage per ricevere il file come buffer
const upload = multer({ storage: multer.memoryStorage() })

router.post('/', auth, upload.single('image'), controller.uploadImage)
router.delete('/', auth, controller.deleteImage)

module.exports = router