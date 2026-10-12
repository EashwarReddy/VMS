const {
  approvalIndividualDetails,
  approvalOrgDetails,
  approvalIndividual,
  approvalOrg,
  cancelationIndividual,
  cancelationOrg,
} = require("../controllers/approvalCancelation.controller");
const {
  verifyTokenApproveCancel,
} = require("../middlewares/verifyTokenApproveCancel");
const { authenticate } = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const router = require("express").Router();
const visitApprovalLimiter = require("../middlewares/visitApprovalLimiter");

router.get(
  "/approvalIndDetails/:id",
  authenticate,authorize(["Admin","Host","Visitor"]),
  approvalIndividualDetails
);

router.get(
  "/approvalIndDetails/visitor//:id",
  approvalIndividualDetails
);

router.put(
  "/approvalIndVisit/:id",
  authenticate,visitApprovalLimiter,authorize(["Admin","Host"]),
  approvalIndividual
);

router.put(
  "/cancelIndVisit/:id",
  authenticate,visitApprovalLimiter,authorize(["Admin","Host","Visitor"]),
  cancelationIndividual
);
router.put(
  "/cancelIndVisit/visitor/:id",visitApprovalLimiter,
  cancelationIndividual
);



module.exports = router;
