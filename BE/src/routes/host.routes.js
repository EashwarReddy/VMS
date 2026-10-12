const {
  getIndividualVisitDetails,
  getOrganizationVisitDetails,
} = require("../controllers/host.controller");
const { authenticate } = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = require("express").Router();

// Route for creating a new visit
router.get("/individualVisits/:email", authenticate,authorize(["Host"]), getIndividualVisitDetails);


module.exports = router;
