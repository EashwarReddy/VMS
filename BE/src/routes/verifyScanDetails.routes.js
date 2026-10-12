const {
  checkIndQRDetails,
  checkOrgQRDetails,
} = require("../controllers/verifyScan.controller");
const { authenticate } = require("../middlewares/authenticate");
const {
  verifyTokenApproveCancel,
} = require("../middlewares/verifyTokenApproveCancel");

const router = require("express").Router();

router.get("/indDetails/:id", authenticate, checkIndQRDetails);
router.get("/orgDetails/:id", authenticate, checkOrgQRDetails);

module.exports = router;
