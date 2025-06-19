const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
       recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
       sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
       post: { type: mongoose.Schema.Types.ObjectId, ref: 'Feed'},
       type: { type: String, enum: ['like', 'comment', 'share', 'quiz', 'tutor'], required: true },
       title: {type: String, required: true},
       read: { type: Boolean, default: false },
}, {
     timestamps: true
})

 module.exports = mongoose.model('Notification', notificationSchema)