const express = require('express')
const { addUserToSessionHistory, getUserQuizHistory, getUserTutorHistory, getUserQuizStat, getUserTutorStat} = require('../controllers/historyController')
const router = express.Router()
const jwtVerify = require('../middleware/verifyJwt')

 router.post('/add-user-history', jwtVerify, addUserToSessionHistory)
 router.get('/get-user-quiz-history', jwtVerify, getUserQuizHistory)
 router.get('/get-user-tutor-history', jwtVerify, getUserTutorHistory)
 router.get('/get-user-quiz-stat', jwtVerify, getUserQuizStat)
 router.get('/get-user-tutor-stat', jwtVerify, getUserTutorStat)

 module.exports = router