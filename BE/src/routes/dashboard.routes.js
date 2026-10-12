const {
  getDetails,
  getDetailsByFromTo,
  getTodaysDetails,
  getDetailsForPlanner,
  getTodaysDetailsForPlanner,
  getDetailsByFromToForPlanner,
} = require("../controllers/dashboard.controller");
const { authenticate } = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = require("express").Router();

// Route for creating a new visit
router.get("/admin/getdetails", authenticate,authorize(["Admin"]),getDetails);
router.get("/admin/getdetails/today/:date", authenticate,authorize(["Admin"]),getTodaysDetails);
router.get("/admin/getDetails/:from/:to",authenticate, authorize(["Admin"]),getDetailsByFromTo);

//#region dashborad api endpoints for planner ##################################################
router.get("/planner/getdetails", authenticate,authorize(["Planner"]),getDetailsForPlanner);
router.get("/planner/getdetails/today/:date", authenticate,authorize(["Planner"]),getTodaysDetailsForPlanner);
router.get("/planner/getDetails/:from/:to",authenticate, authorize(["Planner"]),getDetailsByFromToForPlanner);
//#endregion dashborad api endpoints for planner ##################################################

module.exports = router;
