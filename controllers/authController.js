const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const transporter = require('../config/nodemailer')
const User = require('../models/User')
const mongoose = require('mongoose')

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // if (!email || !password) {
    //   return res.status(400).json({ message: 'All field are required!' });
    // }

    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(401).json({ message: 'Unauthorized no user found!' });
    }

    const confirmPassword = await bcrypt.compare(password, foundUser.password);
    if (!confirmPassword) {
      return res.status(401).json({ message: 'Not Matching Password!' });
    }

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          profilePics: foundUser.profilePics
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'None',
    });

    if (foundUser.isAccountVerified === true) {
      return res.json({ success: false, message: 'Account Already verified!' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10)

    foundUser.verifyOpt = hashedOtp;
    foundUser.verifyOptExpireAt = Date.now() + 15 * 60 * 1000;

    await foundUser.save();

    const mailOption = {
      from: 'durupristine@gmail.com',
      to: foundUser.email,
      subject: 'Account Verification OTP',
      text: `Your OTP IS ${otp}. Verify your account using this OTP`,
    };

    const info = await transporter.sendMail(mailOption);
    console.log('Email sent', info.response);

    return res.json({
      success: true,
      message: 'Verification OTP sent to email.',
      accessToken,
    });
  } catch (error) {
    console.error('Caught error:', error);
    // avoid sending another response if already sent
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    next(error); // fallback just in case
  }
};

const refresh = (req, res) => {
      const cookies = req.cookies

      if(!cookies?.jwt) {
         return res.status(401).json({message: 'Unauthourized invalid cookie recieved!'})
      }                    

      const refreshToken = cookies.jwt

    try{

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
            if(err) return res.status(403).json({message: 'Forbidden!'})

             const foundUser = await User.findOne({email: decoded.email}).exec()

             if(!foundUser) return res.status(401).json({message: 'Unauthorized!'})

                const accessToken = jwt.sign(
                    {
                       "UserInfo": {
                           "userId": foundUser._id
                       }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {expiresIn: '1d'}
               )
        
               res.json({accessToken})
            })


    }catch(error) {
        console.log(error)
        next(error)
    }

}

const logout = (req, res) => {
   const cookies = req.cookies

   if(!cookies?.jwt) return res.sendStatus(204) // No content
   res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'None'
   })

   res.json({message: 'Cookie cleared!'})
}


 const verifyEmail = async (req, res) => {
    const { otp} = req.body
    const userId = req.id
    if(!userId || !otp) {
         return res.status(400).json({message: 'Invalid credential recieved!'})
    }

    try {
        const user = await User.findById(userId)

        if(!user) {
          return res.status(400).json({ message: 'User not found' });
        }

        if(user.verifyOptExpireAt < Date.now()) {
          return res.status(400).json({message: 'OTP Expired!'})
        }
        
        if(!user.verifyOpt) {
          return res.status(404).json({message: 'No otp found!'})
      }
         const match = await bcrypt.compare(otp, user.verifyOpt)

        if(!match) {
           return rse.status(400).json({message: 'Invalid otp'})
        }
    
      user.isAccountVerified = true
      user.verifyOpt = ''
      user.verifyOptExpireAt = ''
    
      await user.save()

      return res.status(200).json({message: 'Email verified successfully!'})
      
    } catch (error) {
      return res.json({success: false, message: error.message}) 
    }}

const sendResetPassword = async (req, res) => {
       const {email} = req.body

       if(!email) {
         return res.status(400).json({message: 'Email is required!'})
       }

     try {
         const user = await User.findOne({email})

          if(!user) {
            res.status(400).json({message: 'No user with this email!'}) 
          }
        
          const otp = String(Math.floor(100000 + Math.random() * 900000)) 

          user.resetOpt = otp
          user.resetOptExpireAt = Date.now() + 15 * 60 * 1000

          await user.save()
        
          const mailOption = {
           from: process.env.SENDER_EMAIL,
           to: user.email,
           subject: 'Password Reset OTP',
           text: `Your OTP for resetting your password is ${otp}.  Use this OTP to proceed with resetting your password `
        }
   
       await transporter.sendMail(mailOption)

       return res.status(200).json({message: 'OTP sent to your email!'})

     } catch(error) {
         return res.json({success: false, message: error?.message})
         console.log(error)
     }
 }

  const resetPassword = async (req, res) => {
       const {email, otp, newPassword} = req.body
       
      if(!email || !otp || !newPassword) {
         return res.status(400).json({message: 'All field are required!'})
      }

     try {
        const user = await User.findOne({email})
        
         if(!user) {
           return res.status(400).json({message: 'User not found!'})
         }

        if(user.resetOpt === "" || user.resetOpt !== otp) {
          return res.status(400).json({message: 'OTP invalid!'})
        }

        if(user.resetOptExpireAt < Date.now()) {
          return res.status(400).json({message: 'OTP has expired!'})
        }

        

     } catch(error) {
       console.log(error)
       return res.json({success: false, message: error?.message})
     }
    
 }

  const resendOtp = async (req, res) => {

  try {
      const userId = req.id

      if(!mongoose.Types.ObjectId.isValid(userId)) {
                     return res.status(400).json({
                      message:'Invalid ID format'
                     })
                  }

     const user = await User.findById(userId)

      if(!user) {
         return res.status(400).json({
           message: 'Invalid ID format.'
         })
      }

      if (user.isAccountVerified === true) {
            return res.json({ success: false, message: 'Account Already verified!' });
          }
      
          const otp = String(Math.floor(100000 + Math.random() * 900000));
          const hashedOtp = await bcrypt.hash(otp, 10)
      
          user.verifyOpt = hashedOtp;
          user.verifyOptExpireAt = Date.now() + 15 * 60 * 1000;
      
          await user.save();
      
          const mailOption = {
            from: 'durupristine@gmail.com',
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP IS ${otp}. Verify your account using this OTP`,
          };
      
          const info = await transporter.sendMail(mailOption);
          console.log('Email sent', info.response);

          return res.json({
      success: true,
       message: 'Verification OTP sent to email.',
       });

     } catch(error) {
        console.error('Caught error:', error);
    // avoid sending another response if already sent
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
     }
   }




module.exports = {login, refresh, logout, verifyEmail, sendResetPassword, resetPassword, resendOtp}