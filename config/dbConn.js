const mongoose = require('mongoose')

const connectDB = async () => {
   if(!process.env.MONGODB_URI) {
         throw new Error('Missing MongoDB URI!')
  }
     try {
    await mongoose.connect(process.env.MONGODB_URI)
     console.log('Connected to MongoDB!')
        
     } catch (error) {
        console.log(error)
     }
}

module.exports = connectDB