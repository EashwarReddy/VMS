// const express = require('express');
// const { getAllImages } = require('../controllers/facerecognition.controller');

// const router = express.Router();
// // const express = require('express');
// const multer = require('multer');
// const {uploadFile} = require('../controllers/facerecognition.controller');



// // Set up multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Save files in 'uploads/' directory
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// // Route to fetch images
// router.get('/images', getAllImages);
// const upload = multer({ storage, fileFilter });

// // Define route
// router.post('/upload', upload.single('zipFile'), uploadFile);
// module.exports = router;



const express = require('express');
const multer = require('multer');
const { getAllImages, uploadFileSuccess, sendLatestPhoto,updateSocketID, getVisitPhoto } = require('../controllers/facerecognition.controller');

const router = express.Router();
const { authenticate } = require("../middlewares/authenticate");

// // Set up multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Save files in 'uploads/' directory
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// // Define file filter function
// const fileFilter = (req, file, cb) => {
//   if (/\.(jpg|jpeg|png|gif)$/i.test(file.originalname)) {
//     cb(null, true); // Accept the file
//   } else {
//     cb(new Error('Only image files are allowed'), false); // Reject the file
//   }
// };


// // Configure multer with storage and file filter
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter
// });

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB
});


// Route to fetch images
router.get('/images', getAllImages);
router.get('/image/:uniqueId', sendLatestPhoto);
router.get('/visitimage/:uniqueId', getVisitPhoto)


// Route to upload file
router.post('/uploadSuccess',upload.single("photos"), uploadFileSuccess);

//sockets logic

router.post('/updateSocketID',updateSocketID)


module.exports = router;
