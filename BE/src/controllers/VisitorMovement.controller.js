const { v4: uuidv4 } = require("uuid");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { validationResult } = require("express-validator");
const VisitorMovementModel = require("../models/VisitorMovement.model");
const VisitsModel = require("../models/Visits.model");

const {logger} = require("../configs/logger");

// Create a new Visitor Movement
async function createVisitorMovement(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(new ApiError(errors.array().map((error) => error.msg)));
    }

    if (!req.body)
      return res.status(400).json(new ApiError(["req.body not found."]));

    // console.log("🚀 ~ createVisitorMovement ~ req.body:", req.body);
    const reqBodyAssets = JSON.parse(req.body.assets);

    let visitorMovement = await VisitorMovementModel.findOne({
      pnr: req.body.pnr,
    });

    if (!visitorMovement) {
      visitorMovement = await VisitorMovementModel.create({
        pnr: req.body.pnr,
        movements: [
          {
            visitInTime: req.body.visitInTime,
            photo: req.file.originalname,
            assets: reqBodyAssets.assets,
            vehicleNo: req.body.vehicleNo,
          },
        ],
        status: "In Campus",
      });

     // if (req.body.type === "Individual")
        await VisitsModel.findOneAndUpdate(
          {
            pnr: req.body.pnr,
          },
          {
            visitstatus: "Ongoing",
          },
          { new: true }
        );
    } else {
      visitorMovement.movements.push({
        visitInTime: req.body.visitInTime,
        photo: req.file.originalname,
        assets: reqBodyAssets.assets,
        vehicleNo: req.body.vehicleNo,
      });

      await VisitorMovementModel.findOneAndUpdate(
        { pnr: req.body.pnr },
        { movements: visitorMovement.movements, status: req.body.status },
        { new: true }
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(null, "Visitor Movement entry recorded successfully.")
      );
  } catch (error) {
    logger.error(error);
    console.error(error);
    await res.status(500).json(new ApiError([error.message]));
  }
}

async function exitVisitorMovement(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(new ApiError(errors.array().map((error) => error.msg)));
    }

    console.log("🚀 ~ exitVisitorMovement ~ req.body:", req.body);
    if (!req.body?.visitOutTime || !req.body?.status)
      return res
        .status(400)
        .json(new ApiError(["visitOutTime OR status not found."]));

    let visitorMovement = await VisitorMovementModel.findOne({
      pnr: req.body.pnr,
    });

    if (!visitorMovement)
      return res
        .status(400)
        .json(new ApiError(["VisitorMovement entry not found."]));

    visitorMovement.movements[
      visitorMovement.movements.length - 1
    ].visitOutTime = req.body.visitOutTime;

    await VisitorMovementModel.findOneAndUpdate(
      { pnr: req.body.pnr },
      { movements: visitorMovement.movements, status: req.body.status },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(null, "Visitor Movement exit recorded successfully.")
      );
  } catch (error) {
    logger.error(error);
    console.error(error);
    await res.status(500).json(new ApiError([error.message]));
  }
}

// Get all movement
async function getAllVisitorMovements(req, res) {
  try {
    const Visitormovements = await VisitorMovementModel.find();
    let visitType='';
// console.log('visitor details', Visitormovements)
    const VisitorMovementDetails = [];
    for (const activity of Visitormovements) {
      let visitorDetails = await VisitsModel.findOne({ pnr: activity.pnr });
      visitType='individual';
     
      if (!visitorDetails)
        return res
          .status(500)
          .json(new ApiError(["Visitor Details not found with the pnr."]));

      VisitorMovementDetails.push({
        pnr: activity.pnr,
        visitorName: `${visitorDetails.visitorfirstname} ${visitorDetails.visitorlastname}`,
        hostName: visitorDetails.hostname,
        purpose: visitorDetails.purpose,
        visitStatus: visitorDetails.visitstatus,
        movements: activity.movements,
        status: activity.status,
        visitLink:visitorDetails.visitLink,
        visitType,
        visitorOrg : visitorDetails.visitororganization,
        inTime : visitorDetails.visitstart,
        outTime : visitorDetails.visitend,
        idType : visitorDetails.visitoridtype,
        movementStatus : activity.status,
        visitors  :1,
        idNo : visitorDetails.visitortidno


      });
    }

  

    return res.json(
      new ApiResponse(
        VisitorMovementDetails,
        "All visitor movement fetched successfully!"
      )
    );
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

// Get a single movement by ID
async function getVisitorMovementById(req, res) {
  try {
    const VisitorMovement = await VisitorMovement.findOne({
      pnr: req.params.id,
    });
    if (!VisitorMovement) {
      return res.status(404).json(new ApiError(["VisitorMovement not found"]));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          VisitorMovement,
          "VisitorMovement fetched successfully!"
        )
      );
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

// async function updateVisitorMovement(req, res) {
//   try {
//   } catch (error) {
//     console.error(error);
//     res.status(500).json(new ApiError([error.message]));
//   }
// }
module.exports = {
  createVisitorMovement,
  exitVisitorMovement,
  getAllVisitorMovements,
  getVisitorMovementById,
  // updateVisitorMovement,
};
