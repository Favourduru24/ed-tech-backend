const mongoose = require('mongoose')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const EMAIL_VERIFY_TEMPLATE = require('../config/emailTemplate')
const transporter = require('../config/nodemailer')

const getAllUser = async (req, res) => {
    const user = await User.find().select('-password')

    if(!user) {
       return res.status(400).json({message: 'No user found!'})
    }

     res.json({
      data: user})
}

   const createUser = async (req, res, next) => {

   const session = await mongoose.startSession()
    session.startTransaction()

    const {username, email, password, confirmPassword} = req.body 

     if(password?.length < 6) return res.status(400).json({message: 'Password must at least be 6 character!'})
 
       if(password !== confirmPassword) {
         return res.status(400).json({message: 'Not matching password!'})
        }
        
       try {

        const existingUser = await User.findOne({email})

        if(existingUser) {
         // return res.status(400).json({message: 'user already created!'})
       const error = new Error('user already exists')
        error.statusCode = 409
        throw error
        }

         const hashPassword = await bcrypt.hash(password, 10)

         const userObject = {
                 email,
                 password: hashPassword,
                 username
             }

             const newUser = await User.create(userObject)
              
             // Sending welcome email
             
             const mailOptions = {
               from: '"ed-tech" <durupristine@gmail.com>',
               to: email,
               subject: 'Welcome to Ed-Tech',
              //  text: `Welcome to Ed-Tech! Your account has been created with the email: ${email}.`,
               html: EMAIL_VERIFY_TEMPLATE.replace("{{email}}", email).replace("{{username}}", username)
             };

              // await transporter.sendMail(mailOptions)
              await transporter.sendMail(mailOptions, (error, info) => {
               if(error) return console.log(error, 'Error sending email!')

                console.log('Email sent', info.response)
             })

             return res.json({success: true})
          
               
      } catch (error) {
          await session.abortTransaction()
          session.endSession()
          next(error)
          console.log(error)
      }
}

const updateUserProfile = async (req, res) => {

  try {
    const userId = req.id
    const { profilePics } = req.body;

    // Validation
    if (!profilePics) {
      return res.status(400).json({ 
        message: "Profile picture URL is required" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: "Invalid user ID format" 
      });
    }

    // Update operation
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePics },
      { new: true, runValidators: true }
    ).select('-password'); // Exclude sensitive fields

    if (!updatedUser) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      message: "Server error during profile update" 
    });
  }
};

module.exports = {createUser, getAllUser, updateUserProfile}