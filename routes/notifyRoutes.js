const express = require('express')
const notificationController = require('../controllers/notificationController')
const router = express.Router()

 router.route('/')
 .get(notificationController.getNotification)

 router.delete('/delete/:id', notificationController.deleteNotification)

 module.exports = router