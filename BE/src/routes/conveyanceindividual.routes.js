const router = require("express").Router();
const { conveyanceValidate } = require("../validations/conveyance");
const authorize = require("../middlewares/authorize");
const {
  createConveyance,
  getAllConveyances,
  getConveyanceById,
  updateConveyance,
  deleteConveyance,
  deleteConveyanceRecord,
} = require("../controllers/conveyanceindividual.controller");
const { authenticate } = require("../middlewares/authenticate");

// Route for creating a new conveyance booking
router.post(
  "/conveyanceindividual",
  authenticate,authorize(["Admin","Planner"]),
  conveyanceValidate,
  createConveyance
);

// Route for getting all conveyance bookings
router.get("/conveyanceindividual", authenticate,authorize(["Admin","Planner"]), getAllConveyances);

// Route for getting a conveyance booking by ID
router.get("/conveyanceindividual/:id", authenticate,authorize(["Admin","Planner"]), getConveyanceById);

// Route for updating a conveyance booking by ID
router.put(
  "/conveyanceindividual/:id",
  authenticate, authenticate,authorize(["Admin","Planner"]),
  updateConveyance
);

// Route for deleting a conveyance booking by ID
router.delete("/conveyanceindividual/:id", authenticate,authorize(["Admin","Planner"]), deleteConveyance);

router.delete(
  "/conveyanceindividual/:pnr/:indId",
  authenticate,
  authorize(["Admin", "Planner"]),
  deleteConveyanceRecord
);


module.exports = router;
