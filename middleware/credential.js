const allowedOrigin = require('../config/allowedOrigin')

//  const credentials = (req, res, next) => {
//     const origin = req.headers.origin;
//      if(allowedOrigin.includes(origin)) {
//         res.header('Access-Control-Allow-Credentials', true)
//      }
//       next()
//  }

const credentials = (req, res, next) => {
   const origin = req.headers.origin;
   // Add Access-Control-Allow-Credentials only if the origin is allowed
   if (allowedOrigin.includes(origin)) {
     res.header('Access-Control-Allow-Credentials', 'true');
   }
   next();
 };

  module.exports = credentials