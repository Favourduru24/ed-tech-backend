const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    profilePics: {
        message: String,
        cloudinaryUrl: String,
        cloudinaryPublicId: String
    },
    verifyOpt: {type: String, default: ''},
    verifyOptExpireAt: {type: Number, default: 0},
    isAccountVerified: {type: String, default: false},
    resetOpt: {type: String, default: ''},
    resetOptExpireAt: {type: Number, default: 0}
},
{
   timestamps: true
}
)

 const User = mongoose.model('User', userSchema)

 module.exports = User