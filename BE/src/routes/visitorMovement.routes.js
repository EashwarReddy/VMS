const router = require("express").Router();
const fs = require("node:fs");
const path = require("node:path");
const multer = require("multer");
const logger = require("../configs/logger");

const {
  createVisitorMovement,
  getAllVisitorMovements,
  getVisitorMovementById,
  exitVisitorMovement,
} = require("../controllers/VisitorMovement.controller");
const { ApiError } = require("../utils/ApiError");
const { authenticate } = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

// //#region multer setup ####################################################################################################
// const uploadedFilesDirPath = path.join(__dirname, "../../", "uploadedFiles");
// // console.log("🚀 ~ uploadedFilesDirPath:", uploadedFilesDirPath);
// const storage = multer.diskStorage({
//   destination: uploadedFilesDirPath,
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const extension = path.extname(file.originalname);
//     cb(null, uniqueSuffix + extension);
//   },
// });

// function fileFilter(req, file, cb) {
//   console.log("🚀 ~ fileFilter ~ file:", file);

//   const allowedFileTypes = [
//     // "application/pdf",
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//   ];

//   if (!allowedFileTypes.includes(file.mimetype))
//     return cb(new Error("Upload only jpeg/jpg/png file."));

//   return cb(null, true);

//   // You can pass an error if something goes wrong:
//   //   cb(new Error("I don't have a clue!"));
// }
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB (maximum file size)
    files: 1, // Maximum number of files
  },
});
//#endregion multer setup #################################################################################################

// Route for creating a new visit
router.post(
  "/visitorMovement/allow",
  authenticate,authorize(["SecurityGuard"]),
  // This middleware is to just show the errors thrown by the multer in our format
  (req, res, next) => {
    // console.log("🚀 ~ file: file.routes.js:46 ~ req:", req)
    upload.single("image")(req, res, (err) => {
      if (err) {
        logger.error(err);
        console.error(err);
        return res.status(400).json(new ApiError([err.message]));
      }

      console.log("🚀 ~ upload.single ~ req.file:", req.file);
      // Check if req.file exists
      if (!req.file)
        return res.status(404).json(new ApiError(["Image not found."]));

      next();
    });
  },
  createVisitorMovement
);

router.put("/visitorMovement/exit", authenticate,authorize(["SecurityGuard"]), exitVisitorMovement);

// Route for getting all visits
router.get("/getAllVisitorMovement", authenticate,authorize(["Admin","SecurityGuard"]), getAllVisitorMovements);

// Route for getting a visit by ID
router.get("/getVisitorMovement/:id", authenticate,authorize(["Admin","SecurityGuard"]), getVisitorMovementById);

module.exports = router;
