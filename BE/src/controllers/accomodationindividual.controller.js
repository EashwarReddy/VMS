const { validationResult } = require("express-validator");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const Accommodation = require("../models/Accomodation.model");
const {logger} = require("../configs/logger");
const mongoose = require('mongoose');
const { logAuditEvent } = require("../configs/audit");

const getAuditContext = (req) => ({
  userId: req.user?.id || "ANONYMOUS",
  userRole: req.user?.role?.name || "UNAUTHENTICATED",
  ip: req.ip?.replace("::ffff:", ""),
  url: req.originalUrl,
  userAgent: req.get("User-Agent"),
});
// Create a new accommodation booking
async function createAccommodation(req, res) {
  const audit = getAuditContext(req);

  try {
    logAuditEvent({
      event: "ACCOMMODATION_CREATE_ATTEMPT",
      ...audit,
      status: "ATTEMPT",
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logAuditEvent({
        event: "ACCOMMODATION_CREATE_FAILED",
        ...audit,
        status: "FAILED",
        reason: "VALIDATION_ERROR",
      });

      return res
        .status(400)
        .json(new ApiError(errors.array().map((e) => e.msg)));
    }

    const accommodation = new Accommodation(req.body);
    await accommodation.save();

    logAuditEvent({
      event: "ACCOMMODATION_CREATE_SUCCESS",
      ...audit,
      status: "SUCCESS",
      meta: { pnr: accommodation.pnr },
    });

    res
      .status(201)
      .json(
        new ApiResponse(null, "Accommodation booking created successfully!")
      );
  } catch (error) {
    logger.error(error);

    logAuditEvent({
      event: "ACCOMMODATION_CREATE_ERROR",
      ...audit,
      status: "ERROR",
      reason: error.message,
    });

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json(new ApiError(messages));
    }

    res.status(500).json(new ApiError([error.message]));
  }
}

// Get all accommodation bookings
async function getAllAccommodations(req, res) {
  try {
    const accommodations = await Accommodation.find();
    res.json(
      new ApiResponse(
        accommodations,
        "All accommodation bookings fetched successfully!"
      )
    );
  } catch (error) {
    logger.error(error);
    console.log(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

// Get an accommodation booking by ID
async function getAccommodationById(req, res) {
  try {
    const accommodation = await Accommodation.findOne({ pnr: req.params.id });

    const finaldetails = {
      pnr: accommodation.pnr,
      arrivalDateTime: accommodation.arrivaldateandtime,
      departureDateTime: accommodation.departuredateandtime,
    };

    const accomodationdetails = accommodation.accomodationdetails.map((item) => ({
        // PNR: item.pnr,

        ind_id: item._id,

        accommodationName: item.accomodationname,
        accommodationAddress: item.accomodationaddress,
        checkin: item.checkindateandtime,
        checkout: item.checkoutdateandtime,
        contactOfHotel: item.accomodationcontact,
        bookedBy: item.bookedby,
        bookedFor: item.bookedfor,
        remarks: item.remarks,
        status: item.status,
      })
    );

    if (!accommodation) {
      return res
        .status(404)
        .json(new ApiError(["Accommodation booking not found"]));
    }
    res.json(
      new ApiResponse(
        { accomodationdetails, finaldetails },
        "Accommodation booking fetched successfully!"
      )
    );
  } catch (error) {
    logger.error(error);
    console.log(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

// Update an accommodation booking by ID
// async function updateAccommodation(req, res) {
//   try {
//     const accomodationdetails = req.body.map((item) => ({
//       pnr: item.PNR,
//       accomodationname: item.accommodationName,
//       accomodationaddress: item.accommodationAddress,
//       checkindateandtime: item.checkin,
//       checkoutdateandtime: item.checkout,
//       accomodationcontact: item.contactOfHotel,
//       bookedby: item.bookedBy,
//       bookedfor: item.bookedFor,
//       remarks: item.remarks,
//     }));
//     const errors = validationResult(accomodationdetails);
//     if (!errors.isEmpty()) {
//       return res
//         .status(400)
//         .json(new ApiError(errors.array().map((error) => error.msg)));
//     }

//     // const accommodation = await Accommodation.findByIdAndUpdate(req.params.id, req.body, { new: true });

//     const accommodation = await Accommodation.findOneAndUpdate(
//       { pnr: req.params.id },
//       { $set: { accomodationdetails: accomodationdetails } },
//       { new: true }
//     );

//     if (!accommodation) {
//       return res
//         .status(404)
//         .json(new ApiError(["Accommodation booking not found"]));
//     }
//     res.json(
//       new ApiResponse(
//         accommodation,
//         "Accommodation booking updated successfully!"
//       )
//     );
//   } catch (error) {
//     logger.error(error);
//     console.log(error);
//     res.status(500).json(new ApiError([error.message]));
//   }
// }

async function updateAccommodation(req, res) {
  const audit = getAuditContext(req);
  const pnr = req.params.id;

  try {
    logAuditEvent({
      event: "ACCOMMODATION_UPDATE_ATTEMPT",
      ...audit,
      status: "ATTEMPT",
      meta: { pnr },
    });

    let payload = req.body;
    if (Array.isArray(payload)) {
      payload = { accomodationdetails: payload };
    }

    const accomodationdetails = payload.accomodationdetails.map((item) => ({
      accomodationname: item.accommodationName,
      accomodationaddress: item.accommodationAddress,
      checkindateandtime: item.checkin,
      checkoutdateandtime: item.checkout,
      accomodationcontact: item.contactOfHotel,
      bookedby: item.bookedBy,
      bookedfor: item.bookedFor,
      remarks: item.remarks,
      status: item.status || "Planned",
    }));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logAuditEvent({
        event: "ACCOMMODATION_UPDATE_FAILED",
        ...audit,
        status: "FAILED",
        reason: "VALIDATION_ERROR",
        meta: { pnr },
      });

      return res
        .status(400)
        .json(new ApiError(errors.array().map((e) => e.msg)));
    }

    const accommodation = await Accommodation.findOneAndUpdate(
      { pnr },
      { $set: { accomodationdetails } },
      { new: true, runValidators: true }
    );

    if (!accommodation) {
      logAuditEvent({
        event: "ACCOMMODATION_UPDATE_FAILED",
        ...audit,
        status: "FAILED",
        reason: "PNR_NOT_FOUND",
        meta: { pnr },
      });

      return res
        .status(404)
        .json(new ApiError(["Accommodation booking not found."]));
    }

    logAuditEvent({
      event: "ACCOMMODATION_UPDATE_SUCCESS",
      ...audit,
      status: "SUCCESS",
      meta: { pnr },
    });

    res.status(200).json(
      new ApiResponse(
        accommodation,
        "Accommodation booking updated successfully!"
      )
    );
  } catch (error) {
    logger.error(error);

    logAuditEvent({
      event: "ACCOMMODATION_UPDATE_ERROR",
      ...audit,
      status: "ERROR",
      reason: error.message,
      meta: { pnr },
    });

    res.status(500).json(new ApiError([error.message]));
  }
}


// Delete an accommodation booking by ID
async function deleteAccommodation(req, res) {
  const audit = getAuditContext(req);
  const pnr = req.params.id;

  try {
    logAuditEvent({
      event: "ACCOMMODATION_DELETE_ATTEMPT",
      ...audit,
      status: "ATTEMPT",
      meta: { pnr },
    });

    const accommodation = await Accommodation.findOneAndDelete({ pnr });

    if (!accommodation) {
      logAuditEvent({
        event: "ACCOMMODATION_DELETE_FAILED",
        ...audit,
        status: "FAILED",
        reason: "PNR_NOT_FOUND",
        meta: { pnr },
      });

      return res
        .status(404)
        .json(new ApiError(["Accommodation booking not found"]));
    }

    logAuditEvent({
      event: "ACCOMMODATION_DELETE_SUCCESS",
      ...audit,
      status: "SUCCESS",
      meta: { pnr },
    });

    res.json(
      new ApiResponse(null, "Accommodation booking deleted successfully!")
    );
  } catch (error) {
    logger.error(error);

    logAuditEvent({
      event: "ACCOMMODATION_DELETE_ERROR",
      ...audit,
      status: "ERROR",
      reason: error.message,
      meta: { pnr },
    });

    res.status(500).json(new ApiError([error.message]));
  }
}


// DELETE /accomodation/accommodationindividual/:pnr/:indId
async function deleteAccommodationRecord(req, res) {
  const audit = getAuditContext(req);
  const { pnr, indId } = req.params;

  try {
    logAuditEvent({
      event: "ACCOMMODATION_RECORD_DELETE_ATTEMPT",
      ...audit,
      status: "ATTEMPT",
      meta: { pnr, recordId: indId },
    });

    if (!mongoose.Types.ObjectId.isValid(indId)) {
      logAuditEvent({
        event: "ACCOMMODATION_RECORD_DELETE_FAILED",
        ...audit,
        status: "FAILED",
        reason: "INVALID_RECORD_ID",
        meta: { pnr, recordId: indId },
      });

      return res.status(400).json(new ApiError(["Invalid accommodation ID"]));
    }

    const accommodation = await Accommodation.findOneAndUpdate(
      { pnr },
      { $pull: { accomodationdetails: { _id: indId } } },
      { new: true }
    );

    if (!accommodation) {
      logAuditEvent({
        event: "ACCOMMODATION_RECORD_DELETE_FAILED",
        ...audit,
        status: "FAILED",
        reason: "PNR_NOT_FOUND",
        meta: { pnr, recordId: indId },
      });

      return res.status(404).json({ message: "PNR not found" });
    }

    logAuditEvent({
      event: "ACCOMMODATION_RECORD_DELETE_SUCCESS",
      ...audit,
      status: "SUCCESS",
      meta: { pnr, recordId: indId },
    });

    res.status(200).json(
      new ApiResponse(
        accommodation,
        "Accommodation record deleted successfully."
      )
    );
  } catch (error) {
    logger.error(error);

    logAuditEvent({
      event: "ACCOMMODATION_RECORD_DELETE_ERROR",
      ...audit,
      status: "ERROR",
      reason: error.message,
      meta: { pnr, recordId: indId },
    });

    res.status(500).json(new ApiError([error.message]));
  }
}



module.exports = {
  createAccommodation,
  getAllAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
  deleteAccommodationRecord,
};
