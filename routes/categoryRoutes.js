const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')

router.route('/')
.post(categoryController.createCategory)
.get(categoryController.getAllCategory)

module.exports = router