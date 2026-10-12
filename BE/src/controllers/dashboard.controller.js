const { v4: uuidv4 } = require("uuid");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { validationResult } = require("express-validator");
const VisitorMovementModel = require("../models/VisitorMovement.model");
const VisitsModel = require("../models/Visits.model");

const AccomodationModel = require("../models/Accomodation.model");

const ConveyanceindividualModel = require("../models/Conveyanceindividual.model");
const ConveyanceOrgModel = require("../models/ConveyanceOrg.model");
const {logger} = require("../configs/logger");

async function getDetails(req, res) {
  try {
    const indPlannedVisitsCount = await VisitsModel.find({
      draft: false,
      visitstatus: "Planned",
    }).countDocuments();



    const indApprovedVisitsCount = await VisitsModel.find({
      draft: false,
      visitstatus: "Approved",
    }).countDocuments();



    const indCancelledVisitsCount = await VisitsModel.find({
      draft: false,
      visitstatus: "Cancelled",
    }).countDocuments();



    const indCompletedVisitsCount = await VisitsModel.find({
      draft: false,
      visitstatus: "Completed",
    }).countDocuments();

 

    const indFailedVisitsCount = await VisitsModel.find({
      draft: false,
      visitstatus: "Failed",
    }).countDocuments();



    //#region Individual Visits chart data ##################################################
    const indVisits = await VisitsModel.find({
      draft: false,
    }).select("hostdepartment");
    const convertedToSmallIndVisits = indVisits.map((visit) =>
      visit.hostdepartment.trim().toLowerCase()
    );
    const filteredIndVisits = convertedToSmallIndVisits.filter(
      (item) => item.length !== 0
    );
    const indChartData = filteredIndVisits.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
    //#endregion Individual Visits chart data ##################################################


    const convertedToSmallOrgVisits = orgVisits.map((visit) =>
      visit.hostdepartment.trim().toLowerCase()
    );
    const filteredOrgVisits = convertedToSmallOrgVisits.filter(
      (item) => item.length !== 0
    );
    const orgChartData = filteredOrgVisits.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
    //#endregion Organization Visits chart data ##################################################

    const resObj = {
      indPlannedVisitsCount,
      orgPlannedVisitsCount,
      indApprovedVisitsCount,
      orgApprovedVisitsCount,
      indCancelledVisitsCount,
      orgCancelledVisitsCount,
      indCompletedVisitsCount,
      orgCompletedVisitsCount,
      indFailedVisitsCount,
      orgFailedVisitsCount,
      indChartData,
      orgChartData,
    };

    return res
      .status(200)
      .json(new ApiResponse(resObj, "Dashboard detials fetched successfully."));
  } catch (error) {
    logger.error(error);
    console.log(error);
    await res.status(500).json(new ApiError([error.message]));
  }
}


async function getDetailsByFromTo(req, res) {
  try {
    const { from, to } = req.params;

    if (!from || !to) {
      return res.status(400).json(new ApiError(["From/To dates not found."]));
    }

    const modifiedFrom = new Date(`${from}T00:00:00.000+00:00`);
    const modifiedTo = new Date(`${to}T23:59:59.999+00:00`);

    // Base query logic for visits that start, end, or span the date range
    const baseQuery = (status) => ({
      draft: false,
      visitstatus: status,
      $or: [
        { visitstart: { $gte: modifiedFrom, $lte: modifiedTo } },
        { visitend: { $gte: modifiedFrom, $lte: modifiedTo } },
        {
          visitstart: { $lt: modifiedFrom },
          visitend: { $gt: modifiedTo },
        },
      ],
    });

    // Count visits by status
    const [
      indPlannedVisitsCount,
      indApprovedVisitsCount,
      indCancelledVisitsCount,
      indCompletedVisitsCount,
      indFailedVisitsCount,
    ] = await Promise.all([
      VisitsModel.countDocuments(baseQuery("Planned")),
      VisitsModel.countDocuments(baseQuery("Approved")),
      VisitsModel.countDocuments(baseQuery("Cancelled")),
      VisitsModel.countDocuments(baseQuery("Completed")),
      VisitsModel.countDocuments(baseQuery("Failed")),
    ]);

    //#region Individual Visits chart data (by hostdepartment) within date range
    const indChartVisits = await VisitsModel.find({
      draft: false,
      $or: [
        { visitstart: { $gte: modifiedFrom, $lte: modifiedTo } },
        { visitend: { $gte: modifiedFrom, $lte: modifiedTo } },
        {
          visitstart: { $lt: modifiedFrom },
          visitend: { $gt: modifiedTo },
        },
      ],
    }).select("hostdepartment");

    const indChartData = {};
    indChartVisits.forEach((visit) => {
      const dept = (visit.hostdepartment || "").trim().toLowerCase();
      if (dept) {
        indChartData[dept] = (indChartData[dept] || 0) + 1;
      }
    });
    //#endregion

    const resObj = {
      indPlannedVisitsCount,
      indApprovedVisitsCount,
      indCancelledVisitsCount,
      indCompletedVisitsCount,
      indFailedVisitsCount,
      indChartData,
    };

    return res
      .status(200)
      .json(new ApiResponse(resObj, "Dashboard details fetched successfully."));
  } catch (error) {
    logger.error(error);
    console.log(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}


async function getTodaysDetails(req, res) {
  try {
    if (!req.params?.date)
      return res.status(404).json(new ApiError(["Date not found."]));

    const startOfDay = new Date(`${req.params?.date}T00:00:00.000+00:00`);
    const endOfDay = new Date(`${req.params?.date}T23:59:59.999+00:00`);
    console.log("🚀 ~ getTodaysDetails admin ~ startOfDay:", startOfDay);
    console.log("🚀 ~ getTodaysDetails admin ~ endOfDay:", endOfDay);

    const indScheduledVisits = await VisitsModel.find({
      draft: false,
      visitstatus: { $in: ["Approved","Ongoing"] },
      $or: [
        {
          visitstart: { $gte: startOfDay, $lt: endOfDay }, // started today
        },
        {
          visitend: { $gte: startOfDay, $lt: endOfDay }, // ended today
        },
        {
          visitstart: { $lt: startOfDay },
          visitend: { $gt: endOfDay }, // spans across today
        },
      ],
    });
    
   // console.log("indScheduledVisits",indScheduledVisits)
    const indScheduledVisitsCount = indScheduledVisits.length;


    const indOngoingVisits = indScheduledVisits.filter(
      (visit) => visit.visitstatus === "Ongoing"
    );

    let indInCampusPNRCount = 0;
    let indExitedPNRCount = 0;
    await Promise.all(
      indOngoingVisits.map(async (visit) => {
        try {
          const visitMovement = await VisitorMovementModel.findOne({
            pnr: visit.pnr,
          });

          if (visitMovement && visitMovement.status === "In Campus")
            ++indInCampusPNRCount;
          if (visitMovement && visitMovement.status === "Exited")
            ++indExitedPNRCount;
        } catch (error) {
          console.log(error);
        }
      })
    );

    const resObj = {
      indScheduledVisitsCount,
      indInCampusPNRCount,
      indExitedPNRCount,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          resObj,
          "Dashboard details for today fetched successfully."
        )
      );
  } catch (error) {
    logger.error(error);
    console.log(error);
    await res.status(500).json(new ApiError([error.message]));
  }
}

async function getDetailsForPlanner(req, res) {
  try {
    const indScheduledVisitsCount = await VisitsModel.find({
      draft: false,
      visitstatus: "Approved",
    }).countDocuments();


    const indAccomodationRequiredCount = await AccomodationModel.find({
      draft: false,
    }).countDocuments();


    const indConveyanceRequiredCount = await ConveyanceindividualModel.find({
      draft: false,
    }).countDocuments();
    const orgConveyanceRequiredCount = await ConveyanceOrgModel.find({
      draft: false,
    }).countDocuments();

    const resObj = {
      indScheduledVisitsCount,
      orgScheduledVisitsCount,
      indAccomodationRequiredCount,
      orgAccomodationRequiredCount,
      indConveyanceRequiredCount,
      orgConveyanceRequiredCount,
    };

    return res
      .status(200)
      .json(new ApiResponse(resObj, "Dashboard detials fetched successfully."));
  } catch (error) {
    logger.error(error);
    console.log(error);
    await res.status(500).json(new ApiError([error.message]));
  }
}



async function getDetailsByFromToForPlanner(req, res) {
  try {
    const { from, to } = req.params;
    if (!from || !to)
      return res.status(400).json(new ApiError(["From/To dates not found."]));

    const modifiedFrom = new Date(`${from}T00:00:00.000+00:00`);
    const modifiedTo = new Date(`${to}T23:59:59.999+00:00`);

    // Visits that either start, end, or span across the date range
    const indScheduledVisitsCount = await VisitsModel.countDocuments({
      draft: false,
      visitstatus: { $in: ["Approved", "Ongoing"] },
      $or: [
        { visitstart: { $gte: modifiedFrom, $lte: modifiedTo } }, // starts in range
        { visitend: { $gte: modifiedFrom, $lte: modifiedTo } },   // ends in range
        {
          visitstart: { $lt: modifiedFrom },
          visitend: { $gt: modifiedTo },
        }, // spans entire range
      ],
    });

    // Accommodations arriving within date range
    const indAccomodationRequiredCount = await AccomodationModel.countDocuments({
      draft: false,
      arrivaldateandtime: { $gte: modifiedFrom, $lte: modifiedTo },
    });

    // Conveyance pickups within date range
    const indConveyanceRequiredCount = await ConveyanceindividualModel.countDocuments({
      draft: false,
      initialpickupdateandtime: { $gte: modifiedFrom, $lte: modifiedTo },
    });

    const resObj = {
      indScheduledVisitsCount,
      indAccomodationRequiredCount,
      indConveyanceRequiredCount,
    };

    return res
      .status(200)
      .json(new ApiResponse(resObj, "Dashboard details fetched successfully."));
  } catch (error) {
    logger.error(error);
    console.log(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}


async function getTodaysDetailsForPlanner(req, res) {
  try {
    if (!req.params?.date)
      return res.status(404).json(new ApiError(["Date not found."]));

    const startOfDay = new Date(`${req.params?.date}T00:00:00.000+00:00`);
    const endOfDay = new Date(`${req.params?.date}T23:59:59.999+00:00`);
    console.log("🚀 ~ getTodaysDetailsForPlanner ~ startOfDay:", startOfDay);
    console.log("🚀 ~ getTodaysDetailsForPlanner ~ endOfDay:", endOfDay);

    const indScheduledVisitsCount = await VisitsModel.find({
      draft: false,
      visitstatus: { $in: ["Approved", "Ongoing"] },
      $or: [
        { visitstart: { $gte: startOfDay, $lte: endOfDay } },
        { visitend: { $gte: startOfDay, $lte: endOfDay } },
        {
          visitstart: { $lt: startOfDay },
          visitend: { $gt: endOfDay },
        },
      ],
    }).countDocuments();



    const indAccomodationRequiredCount = await AccomodationModel.find({
      draft: false,
      arrivaldateandtime: { $gte: startOfDay, $lt: endOfDay },
    }).countDocuments();


    const indConveyanceRequiredCount = await ConveyanceindividualModel.find({
      draft: false,
      arrivaldateandtime: { $gte: startOfDay, $lt: endOfDay },
    }).countDocuments();
    const orgConveyanceRequiredCount = await ConveyanceOrgModel.find({
      draft: false,
      arrivaldateandtime: { $gte: startOfDay, $lt: endOfDay },
    }).countDocuments();

    const resObj = {
      indScheduledVisitsCount,
      orgScheduledVisitsCount,
      indAccomodationRequiredCount,
      orgAccomodationRequiredCount,
      indConveyanceRequiredCount,
      orgConveyanceRequiredCount,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          resObj,
          "Dashboard details for today fetched successfully."
        )
      );
  } catch (error) {
    logger.error(error);
    console.log(error);
    await res.status(500).json(new ApiError([error.message]));
  }
}

module.exports = {
  getDetails,
  getDetailsByFromTo,
  getTodaysDetails,
  getDetailsForPlanner,
  getDetailsByFromToForPlanner,
  getTodaysDetailsForPlanner,
};
