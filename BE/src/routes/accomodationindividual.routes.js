const router = require("express").Router();
const { accomodationValidate } = require("../validations/accomodation");
const authorize = require("../middlewares/authorize");
const {
  createAccommodation,
  getAllAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
  deleteAccommodationRecord,
} = require("../controllers/accomodationindividual.controller");
const { authenticate } = require("../middlewares/authenticate");

// Route for creating a new accommodation booking
router.post(
  "/accommodationindividual",
  authenticate,authorize(["Admin","Planner"]),
  accomodationValidate,
  createAccommodation
);

// Route for getting all accommodation bookings
router.get("/accommodationindividual", authenticate,authorize(["Admin","Planner"]), getAllAccommodations);

// Route for getting an accommodation booking by ID
router.get("/accommodationindividual/:id", authenticate,authorize(["Admin","Planner"]), getAccommodationById);

// Route for updating an accommodation booking by ID
router.put("/accommodationindividual/:id", authenticate,authorize(["Admin","Planner"]), updateAccommodation);

// Route for deleting an accommodation booking by ID
router.delete(
  "/accommodationindividual/:id",
  authenticate,authorize(["Admin","Planner"]),
  deleteAccommodation
);

router.delete(
  "/accommodationindividual/:pnr/:indId",
  authenticate,
  authorize(["Admin", "Planner"]),
  deleteAccommodationRecord
);

module.exports = router;
