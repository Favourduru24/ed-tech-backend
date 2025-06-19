 const express = require('express')
 const router = express.Router()
 const commentController = require('../controllers/commentController')
 const verifyJwt = require('../middleware/verifyJwt')

  router.post('/create-comment', verifyJwt, commentController.createComment)
  router.get('/get-comment/:feedId', commentController.getComment)
  router.delete('/delete-comment/:commentId', verifyJwt, commentController.deleteComment)
  router.put('/like-comment/:commentId', verifyJwt, commentController.likeComment)

  module.exports = router