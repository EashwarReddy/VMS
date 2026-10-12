const router = require("express").Router();
const { validateVisitIndividual } = require("../validations/visits");

const {
  createVisit,
  getAllVisits,
  getVisitById,
  getVisitByEmail,
  updateVisit,
  deleteVisit,
  getAllPastVisits,
  getAllPlannerPastVisits,
  getAllPlannerVisits
} = require("../controllers/visitindividual.controller");
const { authenticate } = require("../middlewares/authenticate");
const allowSameEmailOnly = require("../middlewares/allowSameEmailOnly");
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const authorize = require("../middlewares/authorize");
const visitSubmissionLimiter = require("../middlewares/visitRateLimiter");
// const upload = require('../middlewares/upload');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Resolve the path to two levels up from the current directory
    const uploadPath = path.resolve(__dirname, '../../uploads/visitorsPhotos/');

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


const upload3 = multer({ storage: storage });
// Route for creating a new visit
router.post(
  "/visitindividual",
  authenticate,authorize(["Visitor","SecurityGuard","Host"]),
  visitSubmissionLimiter,
  upload3.single('file'),
  validateVisitIndividual,
  createVisit
);

// Route for getting all visits
router.get("/visitindividual", authenticate,authorize(["Admin","Planner"]), getAllVisits);

router.get("/visitindividual/planner", authenticate,authorize(["Admin","Planner"]), getAllPlannerVisits);

router.get("/visitindividual/past", authenticate,authorize(["Admin","Planner","Host"]), getAllPastVisits);


router.get("/visitindividual/plannerpast", authenticate,authorize(["Admin","Planner"]), getAllPlannerPastVisits);

// Route for getting a visit by Email
router.get("/visitindividual/email", authenticate,allowSameEmailOnly(), getVisitByEmail);

// Route for getting a visit by ID
router.get("/visitindividual/:id", authenticate, getVisitById);

// Route for updating a visit by ID
router.put(
  "/visitindividual/:id",
  authenticate,authorize(["Visitor","SecurityGuard","Host"]),
  upload3.single('file'),
  validateVisitIndividual,
  updateVisit
);

// Route for deleting a visit by ID
router.delete("/visitindividual/:id", authenticate,authorize(["Visitor","SecurityGuard","Host"]), deleteVisit);

module.exports = router;
