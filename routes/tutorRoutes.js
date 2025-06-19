const express = require('express')
const router = express.Router()
const tutorController = require('../controllers/tutorController')
const verifyJwt = require('../middleware/verifyJwt')

router.post('/create-tutor', tutorController.createTutor)
router.get('/get-tutor', tutorController.getAllTutor)
router.get('/get-tutor/:id', tutorController.getTutorById)
router.get('/get-tutor/user/:userId', tutorController.getUserTutor)
router.get('/get-tutor-chart', verifyJwt, tutorController.getUserLessonsByTopic)


module.exports = router