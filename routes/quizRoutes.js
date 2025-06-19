const express = require('express')
const router = express.Router()
const quizController = require('../controllers/quizController')

router.post('/create-quiz', quizController.createQuiz)
router.get('/get-quiz', quizController.getAllQuiz)
router.get('/get-quiz/user/:userId', quizController.getUserQuiz)
router.get('/get-quiz/:id', quizController.getQuizById)
module.exports = router