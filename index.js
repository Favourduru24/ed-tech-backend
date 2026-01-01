//  require('dotenv').config()
//  const express = require('express')
//  const PORT = process.env.PORT
//  const cookieParser = require('cookie-parser')
//  const connectDB = require('./config/dbConn')
//  const errorMiddlerware = require('./middleware/errorHandler')
//  const cors = require('cors')
//  const corsOption = require('./config/corsOption')
//  const {logger} = require('./middleware/logger')
//  const mongoose = require('mongoose')
// const multer = require('multer')
// const sharp = require('sharp')
// const path = require('path')
// const fs = require('fs')
// const credentials = require('./middleware/credential')
// const fsPromise = require('fs').promises
// const cloudinary = require('./config/cloudinary')
// const app = express()


// connectDB()
// //Built in Middleware
//  app.use(express.static('public'))
//  app.use(express.json())
//  app.use(cookieParser())
//  app.use(express.urlencoded({extended: false}))
//  app.use(cors(corsOption))
//  app.use(logger)

//  //routes
// app.use('/users', require('./routes/usersRoutes'))
// app.use('/auth', require('./routes/authsRoutes'))
// app.use('/feeds', require('./routes/feedsRoutes'))
// app.use('/category', require('./routes/categoryRoutes'))
// app.use('/comment', require('./routes/commentRoutes'))
// app.use('/notification', require('./routes/notifyRoutes'))
// app.use("/tutor", require('./routes/tutorRoutes'))
// app.use('/quiz', require('./routes/quizRoutes'))
// app.use('/history', require('./routes/historyRoutes'))
 
// //global Error middleware
//   app.use(errorMiddlerware)
   
//   //image upload with multer
//    const storage = multer.diskStorage({
//       destination: async (req, file, cb) => {
//           if(!fs.existsSync(path.join(__dirname, '.', 'public'))) {
//             await  fsPromise.mkdir(path.join(__dirname, '.', 'public'))
//           }
//          cb(null, 'public')
//       },
//       filename: (req, file, cb) => {
//           cb(null, Date.now() + file.originalname)
//       }
//    })

//     const upload = multer({
//        storage: storage,
//        limits: { fileSize: 10 * 1024 * 1024 } 
//     }).single('image')

//    const compressImage = async (filePath) => {
//       const compressedPath = filePath.replace(path.extname(filePath), '-compressed.webp')
//       await sharp(filePath).resize({width: 800}).webp({quality: 80}).toFile(compressedPath) 
//       return compressedPath
//     }

//    app.use('/upload', upload, async (req, res) => {
//       if(!req.file) {
//         return res.status(400).json({message: 'No Image uploaded'})
//       } 
    
//       try {
//         const localImagePath = req.file.path
//         const compressedImagePath = await compressImage(localImagePath)
    
//         cloudinary.uploader.upload(compressedImagePath, {
//           transformation: [
//             {width: 800, format: 'webp', crop: 'limit'}
//           ],
//           folder: 'user-image'
//         }).then((cloudinaryResult) => {
//           fs.unlinkSync(localImagePath)
//           fs.unlinkSync(compressedImagePath)
    
//           return res.status(200).json({
//             message: 'image uploaded sucessfully!',
//             cloudinaryUrl: cloudinaryResult.secure_url,
//             cloudinaryPublicId: cloudinaryResult.public_id
//           })
//         }).catch((error) => {
//           return res.status(500).json({message: 'Error uploading image to cloudinary!'})
//         })
    
//       } catch(error) {
//         console.log('Error processing the image', error)   
//         return res.status(500).json({message: 'Error processing the image'})
//       }
//     })
// //connection
// mongoose.connection.once('open', () => {
//  app.listen(PORT, () =>  console.log(`Server running on Port: ${PORT}`))
// })

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const fsPromise = require('fs').promises;
const cloudinary = require('./config/cloudinary');
const connectDB = require('./config/dbConn');
const { logger } = require('./middleware/logger');
const errorMiddleware = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// ------------------ CORS Setup ------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://ed-tech-frontend-e8zm.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// ✅ Apply CORS globally BEFORE all routes
app.use(cors(corsOptions));

// ✅ Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// ------------------ Middleware ------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(logger);

// ------------------ Database ------------------
connectDB();

// ------------------ Routes ------------------
app.use('/users', require('./routes/usersRoutes'));
app.use('/auth', require('./routes/authsRoutes'));
app.use('/feeds', require('./routes/feedsRoutes'));
app.use('/category', require('./routes/categoryRoutes'));
app.use('/comment', require('./routes/commentRoutes'));
app.use('/notification', require('./routes/notifyRoutes'));
app.use('/tutor', require('./routes/tutorRoutes'));
app.use('/quiz', require('./routes/quizRoutes'));
app.use('/history', require('./routes/historyRoutes'));

// ------------------ Global Error Middleware ------------------
app.use(errorMiddleware);

// ------------------ Image Upload ------------------
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const publicPath = path.join(__dirname, 'public');
    if (!fs.existsSync(publicPath)) {
      await fsPromise.mkdir(publicPath);
    }
    cb(null, 'public');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('image');

const compressImage = async (filePath) => {
  const compressedPath = filePath.replace(path.extname(filePath), '-compressed.webp');
  await sharp(filePath).resize({ width: 800 }).webp({ quality: 80 }).toFile(compressedPath);
  return compressedPath;
};

app.post('/upload', upload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    const localImagePath = req.file.path;
    const compressedImagePath = await compressImage(localImagePath);

    const result = await cloudinary.uploader.upload(compressedImagePath, {
      transformation: [{ width: 800, format: 'webp', crop: 'limit' }],
      folder: 'user-image'
    });

    // Delete local files
    fs.unlinkSync(localImagePath);
    fs.unlinkSync(compressedImagePath);

    res.status(200).json({
      message: 'Image uploaded successfully!',
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ message: 'Error processing the image' });
  }
});

// ------------------ Start Server ------------------
mongoose.connection.once('open', () => {
  app.listen(PORT, () => console.log(`Server running on Port: ${PORT}`));
});
