const { v4: uuidv4 } = require("uuid");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { validationResult } = require("express-validator");
const { VisitorMovement } = require("../models/VisitorMovement.model");
const VisitorMovementModel = require("../models/VisitorMovement.model");
const VisitsModel = require("../models/Visits.model");

const {logger} = require("../configs/logger");

// Create a new Visitor Movement

async function getIndividualVisitDetails(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(new ApiError(errors.array().map((error) => error.msg)));
    }

    const requestedEmail = req.params?.email;
    if (!requestedEmail) {
      return res.status(400).json(new ApiError(["Email not found."]));
    }

    // ✅ Check if the logged-in user's email matches the requested email
    if (req.user.email !== requestedEmail) {
      return res.status(403).json(new ApiError(["Access denied: Unauthorized user."]));
    }

    // ✅ Fetch visit details for the user's email
    const indVisits = await VisitsModel.find({
      hostemail: requestedEmail,
      draft: false,
    });

    return res
      .status(200)
      .json(new ApiResponse(indVisits, "Visits details fetched successfully."));
  } catch (error) {
    logger.error(error);
    console.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}



module.exports = {
  getIndividualVisitDetails,
};
