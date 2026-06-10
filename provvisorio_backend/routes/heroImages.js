const router = require('express').Router()
const controller = require('../controllers/heroImages')
const auth = require('../middleware/auth')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })

// Public: get hero images (no auth needed)
router.get('/', controller.getHeroImages)

// Admin: add/delete hero images (auth required)
router.post('/', auth, upload.single('image'), controller.addHeroImage)
router.delete('/:id', auth, controller.deleteHeroImage)

module.exports = router