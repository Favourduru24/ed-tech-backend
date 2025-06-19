const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({

    feedId: {
     type: mongoose.Schema.Types.ObjectId,
     ref:'Feed',
     required: true
    },
     userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
     },
     content: {
        type: String,
        required: true
     },
     reply:{
        type: String
     },
      likes: [{
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User'
           }]
},
 {
     timestamps: true
 }
)

 module.exports = mongoose.model('Comment', commentSchema)