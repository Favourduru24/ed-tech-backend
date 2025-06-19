 const nodemailer = require('nodemailer')  

//  const transporter = nodemailer.createTransport({
//     host: 'smtp-relay.brevo.com',
//     secure: true,
//      port: 587,
//      auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASSWORD
//      }
//  })

//  module.exports = transporter

const accountEmail = 'durupristine@gmail.com'

 const transporter = nodemailer.createTransport({
    service: 'gmail',
     auth: {
        user: accountEmail,
        pass: process.env.EMAIL_PASSWORD
     }
 })

 module.exports = transporter