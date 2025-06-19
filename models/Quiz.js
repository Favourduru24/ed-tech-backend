const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema({

    name:{
         type: String,
         required: true
    },
    subject:{
         type: String,
         required: true
    },
    visibility:{
         type: String,
         required: true
    },
    questions:
     {
          type: [String],
          required: true 
        },
    voice:{
         type: String,
         required: true
    }, 
    duration:{
         type: String,
         required: true
    },
    voicePattern:{
         type: String,
         required: true
    },
    topic:{
         type: String,
         required: true
    },
     level: {
        type: String,
         required: true
     },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }

}, {
     timestamps: true
})

 const Quiz = mongoose.model('Quiz', quizSchema)

 module.exports = Quiz