const express = require('express')
const router = express.Router()
const feedController = require('../controllers/feedController')
const verifyJwt = require('../middleware/verifyJwt')


router.route('/')
.post(feedController.createFeed)
.get(feedController.getAllFeed)

router.get('/feed/:id', feedController.getFeedById)
router.get('/feed/user/:userId', verifyJwt, feedController.getUserFeed)
router.get('/feed-category/:id/:categoryId', feedController.getRelatedFeedByCategory)
router.patch('/feed/update/:id', feedController.updateFeed)
router.put('/feed/like/:id', feedController.likeFeed)
router.delete('/delete/:id', verifyJwt, feedController.deleteFeed)


module.exports = router