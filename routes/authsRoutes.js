const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const loginLimiter = require('../middleware/loginLimiter')
const verifyJwt = require('../middleware/verifyJwt')


 router.route('/login')
 .post(loginLimiter, authController.login)

 router.route('/refresh')
.get(authController.refresh)

router.route('/logout')
.post(authController.logout)

router.route('/verify-account')
.post(verifyJwt, authController.verifyEmail)

router.route('/resend-otp')
.post(verifyJwt, authController.resendOtp)

router.route('/send-reset-password')
.post(authController.sendResetPassword)

module.exports = router