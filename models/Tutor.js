const mongoose = require('mongoose')

const tutorSchema = new mongoose.Schema({

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
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }

}, {
      timestamps: true
})

 const Tutor = mongoose.model('Tutor', tutorSchema)

 module.exports = Tutor