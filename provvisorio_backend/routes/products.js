const router = require('express').Router()
const controller = require('../controllers/products')
const auth = require('../middleware/auth')

router.get('/', controller.getAll)
router.get('/:slug', controller.getBySlug)
router.post('/', auth, controller.create)
router.put('/:id', auth, controller.update)
router.delete('/:id', auth, controller.remove)

module.exports = router
