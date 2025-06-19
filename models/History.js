const mongoose = require('mongoose')

const historySchema = new mongoose.Schema({
    tutorId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Tutor'
    },
    userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Quiz'
    }
},
 {
    timestamps: true
 }
)

const History = mongoose.model("History", historySchema)

 module.exports = History