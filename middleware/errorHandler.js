const {logEvent} = require('./logger')

const errorMiddlerware = (err, req, res, next) => {
      try {
         let error = {...err}

         error.message = err.message

          console.log(err)

     //Mongoose bad ObjectId
      if(err.name === 'CastError') {
        const message = 'Resource not found!'

         error = new Error(message)
         error.statusCode = 404
      }
    // Mongoose duplicate key
      if(err.code === 11000) {
        const message = 'Duplicate field value entered!'
        error = new Error(message)
        error.statusCode = 400
      }

      //Mongoose validation error
        if(err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message)
            error = new Error(message.join(',').replaceAll("Path", ""))
            error.statusCode = 400
        }

        //  logEvent(`${err.name}\t${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')

        res.status(error.statusCode || 500).json({success: false, error: error.message || 'Server Error!'})
          
      } catch (error) {
        next(error)
      }
}

module.exports =  errorMiddlerware