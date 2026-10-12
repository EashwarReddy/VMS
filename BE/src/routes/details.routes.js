const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const { ApiError } = require("../utils/ApiError");
const { authenticate } = require("../middlewares/authenticate");
const {
  getAccomodationDetailsByPNR,
  getConveyanceDetailsByPNR,
  getCombinedIndDetailsByPNR,
  getCombinedOrgDetailsByPNR,
  getCombinedIndDetailsByPNRTracking,
  getCombinedOrgDetailsByPNRTracking,
} = require("../controllers/details.controllers");
const {
  verifyTokenTrackDetails,
} = require("../middlewares/verifyTokenTrackDetails");
const VisitTrackToken = require("../models/VisitTrackToken.model");
// Route for getting details by PNR
router.get("/accomodation-details/:pnr", async (req, res) => {
  try {
    const pnr = req.params.pnr;
    const result = await getAccomodationDetailsByPNR(pnr);
    res.json(result);
  } catch (error) {
    console.error("Error in fetching details: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conveyance-details/:pnr", async (req, res) => {
  try {
    const pnr = req.params.pnr;
    const result = await getConveyanceDetailsByPNR(pnr);
    res.json(result);
  } catch (error) {
    console.error("Error in fetching details: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/all-ind-details/:pnr", async (req, res) => {
  try {
    const pnr = req.params.pnr;
    const result = await getCombinedIndDetailsByPNR(pnr);
    res.json(result);
  } catch (error) {
    console.error("Error in fetching details: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// track details routes individual
router.get("/ind-details/:pnr",authenticate, async (req, res) => {
  try {
    const pnr = req.params.pnr;
    const result = await getCombinedIndDetailsByPNRTracking(pnr);
    res.json(result);
  } catch (error) {
    console.error("Error in fetching details: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// track details routes individual
router.get("/ind-details/track/:pnr", async (req, res) => {
  try {
    const pnr = req.params.pnr;
     // 1️⃣ Find token in DB
     const tokenRow = await VisitTrackToken.findOne({ pnr });

     if (!tokenRow) {
       return res
       .status(403)
       .json(new ApiError([`Unauthorized access`]));
     }
    const result = await getCombinedIndDetailsByPNRTracking(pnr);
    res.json(result);
  } catch (error) {
    console.error("Error in fetching details: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
