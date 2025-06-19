  const mongoose = require("mongoose")

 const feedSchema = new mongoose.Schema({
     title: {
         type: String,
         required: [true, 'Title is required!']
     },
     pitch: {
         type: String,
         required: [true, 'Pitch is required!']
     },
     image: {
        message: String,
        cloudinaryUrl: String,
        cloudinaryPublicId: String
      },
     category: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
     },
     userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
     },
     comment: {
       type: String,
     },
      description:{
          type:String,
          required: true
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

 const Feed = mongoose.model('Feed', feedSchema)

 module.exports = Feed