const VisitorMovementModel = require("../models/VisitorMovement.model");
const VisitsModel = require("../models/Visits.model");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const {logger} = require("../configs/logger");

async function checkIndQRDetails(req, res) {
  try {
    let visit = await VisitsModel.findOne({ pnr: req.params.id });

    if (!visit)
      return res
        .status(404)
        .json(new ApiResponse(null, "Visit with given pnr not found."));

    if (visit.visitstatus === "Cancelled")
      return res.status(200).json(new ApiResponse(null, "Visit cancelled."));

    if (visit.visitstatus === "Completed")
      return res.status(200).json(new ApiResponse(null, "Visit completed."));

    const now = new Date();
    console.log("🚀 ~ checkIndQRDetails ~ now:", now);
    console.log("🚀 ~ checkIndQRDetails ~ visit.visitstart:", visit.visitstart);
    console.log("🚀 ~ checkIndQRDetails ~ visit.visitend:", visit.visitend);
    if (visit.visitstart > now)
      return res.status(200).json(new ApiResponse(null, "Visiting early."));

    if (visit.visitstatus === "Ongoing" && visit.visitend < now)
      visit = await VisitsModel.findOneAndUpdate(
        { pnr: req.params.id },
        { visitstatus: "Completed" }
      );
    if (visit.visitstatus !== "Ongoing" && visit.visitend < now) {
      visit = await VisitsModel.findOneAndUpdate(
        { pnr: req.params.id },
        { visitstatus: "Failed" },
        { new: true }
      );

      return res
        .status(200)
        .json(new ApiResponse(null, "Visit period expired."));
    }

    if (visit.visitstatus === "Approved" || visit.visitstatus === "Ongoing") {
      const visitMovement = await VisitorMovementModel.findOne({
        pnr: req.params.id,
      });

      let resObj = {
        pnr: visit.pnr,
        visitorName: `${visit.visitorfirstname} ${visit.visitorlastname}`,
        visitorOrg: visit.visitororganization,
        inTime: visit.visitstart,
        outTime: visit.visitend,
        hostName: visit.hostname,
        purpose: visit.purpose,
        idType: visit.visitoridtype,
        idNo: visit.visitortidno,
        movementStatus: "none",
        visitors: "1",
      };

      if (!visitMovement)
        return res
          .status(200)
          .json(new ApiResponse(resObj, "Visitor movement record not found."));
      else
        resObj = {
          pnr: visitMovement.pnr,
          visitorName: `${visit.visitorfirstname} ${visit.visitorlastname}`,
          visitorOrg: visit.visitororganization,
          inTime: visit.visitstart,
          outTime: visit.visitend,
          hostName: visit.hostname,
          purpose: visit.purpose,
          idType: visit.visitoridtype,
          idNo: visit.visitortidno,
          movementStatus: visitMovement.status,
          movementDetails: visitMovement,
          visitors: "1",
        };

      return res
        .status(200)
        .json(
          new ApiResponse(
            resObj,
            "Visitor details and movement fetched successfully."
          )
        );
    } else throw new Error("Invalid visitstatus.");
  } catch (error) {
    logger.error(error);
    console.error(error);
    await res.status(500).json(new ApiError([error.message]));
  }
}

async function checkOrgQRDetails(req, res) {
  try {
    let visit = await VisitsOrgModel.findOne({ pnr: req.params.id });

    if (!visit)
      return res
        .status(404)
        .json(new ApiResponse(null, "Visit with given pnr not found."));

    if (visit.visitstatus === "Cancelled")
      return res.status(200).json(new ApiResponse(null, "Visit cancelled."));

    if (visit.visitstatus === "Completed")
      return res.status(200).json(new ApiResponse(null, "Visit completed."));

    const now = new Date();
    if (visit.visitstart > now)
      return res.status(200).json(new ApiResponse(null, "Visiting early."));

    if (visit.visitstatus === "Ongoing" && visit.visitend < now)
      visit = await VisitsOrgModel.findOneAndUpdate(
        { pnr: req.params.id },
        { visitstatus: "Completed" }
      );
    if (visit.visitstatus !== "Ongoing" && visit.visitend < now) {
      visit = await VisitsOrgModel.findOneAndUpdate(
        { pnr: req.params.id },
        { visitstatus: "Failed" },
        { new: true }
      );

      return res
        .status(200)
        .json(new ApiResponse(null, "Visit period expired."));
    }

    if (visit.visitstatus === "Approved" || visit.visitstatus === "Ongoing") {
      const visitMovement = await VisitorMovementModel.findOne({
        pnr: req.params.id,
      });

      let resObj = {
        pnr: visit.pnr,
        visitorName: `${visit.visitorfirstname} ${visit.visitorlastname}`,
        visitorOrg: visit.visitororganization,
        inTime: visit.visitstart,
        outTime: visit.visitend,
        hostName: visit.hostname,
        purpose: visit.purpose,
        idType: visit.visitoridtype,
        idNo: visit.visitortidno,
        movementStatus: "none",
        visitor: visit.secondaryvisitors.length + 1,
      };

      if (!visitMovement)
        return res
          .status(200)
          .json(new ApiResponse(resObj, "Visitor movement record not found."));
      else
        resObj = {
          pnr: visitMovement.pnr,
          visitorName: `${visit.visitorfirstname} ${visit.visitorlastname}`,
          visitorOrg: visit.visitororganization,
          inTime: visit.visitstart,
          outTime: visit.visitend,
          hostName: visit.hostname,
          purpose: visit.purpose,
          idType: visit.visitoridtype,
          idNo: visit.visitortidno,
          movementStatus: visitMovement.status,
          movementDetails: visitMovement,
          visitor: visit.secondaryvisitors.length + 1,
        };

      return res
        .status(200)
        .json(
          new ApiResponse(
            resObj,
            "Visitor details and movement fetched successfully."
          )
        );
    } else throw new Error("Invalid visitstatus.");
  } catch (error) {
    logger.error(error);
    console.error(error);
    await res.status(500).json(new ApiError([error.message]));
  }
}

module.exports = {
  checkIndQRDetails,
  checkOrgQRDetails,
};
