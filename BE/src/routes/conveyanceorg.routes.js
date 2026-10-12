const router = require("express").Router();
const { conveyanceValidate } = require("../validations/conveyance");
const {
  createConveyanceOrganization,
  getAllConveyanceOrganizations,
  getConveyanceOrganizationById,
  updateConveyanceOrganization,
  deleteConveyanceOrganization,
} = require("../controllers/conveyanceorg.controller");
const { authenticate } = require("../middlewares/authenticate");

// Route for creating a new conveyance booking
router.post(
  "/conveyanceorganization",
  authenticate,
  conveyanceValidate,
  createConveyanceOrganization
);

// Route for getting all conveyance bookings
router.get(
  "/conveyanceorganization",
  authenticate,
  getAllConveyanceOrganizations
);

// Route for getting a conveyance booking by ID
router.get(
  "/conveyanceorganization/:id",
  authenticate,
  getConveyanceOrganizationById
);

// Route for updating a conveyance booking by ID
router.put(
  "/conveyanceorganization/:id",
  authenticate,
  conveyanceValidate,
  updateConveyanceOrganization
);

// Route for deleting a conveyance booking by ID
router.delete(
  "/conveyanceorganization/:id",
  authenticate,
  deleteConveyanceOrganization
);

module.exports = router;
