const router = require('express').Router()


const PetController = require('../controllers/PetController')

// middlewares
// Garantir que quem não esteja autenticado adicione um pet.
const verifyToken = require('../helpers/verify-token')
const { imageUpload } = require('../helpers/image-upload')


router.post('/create', verifyToken, imageUpload.array('images'), PetController.create)

module.exports = router