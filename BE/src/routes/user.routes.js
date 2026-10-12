const router = require("express").Router();
const { body } = require("express-validator");
const multer = require('multer');
const { upload, setUploadType, scanFile } = require("../middlewares/multerMiddleware");
const { requireCaptcha } = require("./captcha.routes");
const { logger, securityLogger } = require("../configs/logger"); 
const registerUserLimiter = require("../middlewares/registerUserLimiter");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const {
  roleRegisterUser,
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
  sendPasswordResetEmail,
  resetPassword,
  handleRefreshToken,
  sendUserDetails,
  sendAllUsersDetails,
  enableOrDisableUserById,
  getUserById,
  uploadProfilePhoto,
  getProfilePhoto,
  getVisitPhoto,

} = require("../controllers/user.controller");
const {
  emailValidationChain,
  passwordValidationChain,
  mobileNoValidationChain,
  pincodeValidationChain,
} = require("../validations/validChains");
const { authenticate } = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const passport = require("passport");
const {
  checkRefreshTokenCookie,
} = require("../middlewares/checkRefreshTokenCookie");
const { verifyToken } = require("../middlewares/verifyToken");
const path = require('path');
const fs = require('fs');
const rateLimit = require("express-rate-limit");
//const upload = require("../middlewares/upload");
//#region auth routes ==================================================


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Resolve the path to two levels up from the current directory
    const uploadPath = path.resolve(__dirname, '../../uploads/profilePhotos/');

    // Check if the folder exists, if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Create the folder and its parent directories if needed
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});


const upload2 = multer({ storage: storage });



// Rate limiter for forgot password
// Rate limiter for forgot password 
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip, // optional: limit per email

  handler: (req, res) => {
    const identifier = req.body.email || req.ip;

    // Log excessive password reset attempts for security monitoring
    securityLogger.warn(`Too many password reset requests for identifier: ${identifier}`);

    // return res.status(429).json({
    //   success: false,
    //   errors: ["Too many password reset requests. Try again later."],
    //   data: null
    // });

      return res.status(429).json(
            new ApiError([
             "Too many password reset requests. Try again later.",
            ])
          );
  }
});


router.post(
  "/roleregister",
  upload2.single('file'),
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("lastName").trim().notEmpty().withMessage("Last name is required."),
  // body("DOB").trim().isDate().withMessage("Date of birth is required."),
  body("gender").trim().notEmpty().withMessage("Gender is required."),
  emailValidationChain(),
  mobileNoValidationChain(),
  pincodeValidationChain(),
  body("state").trim().notEmpty().withMessage("State is required."),
  body("district").trim().notEmpty().withMessage("District is required."),
  body("address").trim().notEmpty().withMessage("Address is required."),
  body("organisation")
    .trim()
    .notEmpty()
    .withMessage("Organisation is required."),
  body("referenceEmail")
    .trim()
    .notEmpty()
    .withMessage("Reference email is required."),
  passwordValidationChain(),registerUserLimiter,
  authenticate,authorize(["Admin"]),roleRegisterUser
);

router.post(
  "/register",
  upload2.single('file'),
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("lastName").trim().notEmpty().withMessage("Last name is required."),
  // body("DOB").trim().isDate().withMessage("Date of birth is required."),
  body("gender").trim().notEmpty().withMessage("Gender is required."),
  emailValidationChain(),
  mobileNoValidationChain(),
  pincodeValidationChain(),
  body("state").trim().notEmpty().withMessage("State is required."),
  body("district").trim().notEmpty().withMessage("District is required."),
  body("address").trim().notEmpty().withMessage("Address is required."),
  body("organisation")
    .trim()
    .notEmpty()
    .withMessage("Organisation is required."),
  body("referenceEmail")
    .trim()
    .notEmpty()
    .withMessage("Reference email is required."),
  passwordValidationChain(),registerUserLimiter,
  registerUser
);



router.get("/verify", verifyUser);

router.post("/login",requireCaptcha,loginUser);

router.get("/logout", authenticate, logoutUser);

router.post(
  "/password/reset/sendEmail",
  emailValidationChain(),forgotPasswordLimiter,
  sendPasswordResetEmail
);

router.post(
  "/password/reset",
  passwordValidationChain(),
  forgotPasswordLimiter,
  resetPassword
);

router.get("/token/refresh", handleRefreshToken);
//#endregion auth routes ===============================================

//#region user routes ====================================================================================================
router.get("/", authenticate, sendUserDetails);

router.get("/getAllUsers", authenticate,authorize(["Admin"]), sendAllUsersDetails);

router.get("/:id", authenticate, getUserById);

router.put("/:id", authenticate,authorize(["Admin"]), enableOrDisableUserById);

//router.put("/profilePhoto/:id", authenticate, upload2.single('profilePhoto') ,uploadProfilePhoto)

router.post(
  "/profilePhoto/:id",
  authenticate,
  setUploadType("profilePhotos"),
  upload.single("profilePhoto"),
  // scanFile, // Scan file after upload
  uploadProfilePhoto
);

router.get("/profilePhoto/:id",getProfilePhoto)
router.get("/visitorPhoto/:id", authenticate ,getVisitPhoto)





//#endregion user routes =================================================================================================

module.exports = router;
