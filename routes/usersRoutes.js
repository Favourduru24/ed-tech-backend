const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const verifyJwt = require('../middleware/verifyJwt')

router.route('/')
.get(usersController.getAllUser)
.post(usersController.createUser)

router.put('/profile-pic', verifyJwt, usersController.updateUserProfile)

module.exports = router