const { validationResult } = require("express-validator");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const ConveyanceIndividual = require("../models/Conveyanceindividual.model");
const {logger} = require("../configs/logger");
const { logAuditEvent } = require("../configs/audit");
// Create a new conveyance booking

const getAuditContext = (req) => ({
  userId: req.user?.id || "ANONYMOUS",
  userRole: req.user?.role?.name || "UNAUTHENTICATED",
  ip: req.ip?.replace("::ffff:", ""),
  url: req.originalUrl,
  userAgent: req.get("User-Agent"),
});


async function createConveyance(req, res) {
  const audit = getAuditContext(req);

  try {
    logAuditEvent({
      event: "CONVEYANCE_CREATE_ATTEMPT",
      ...audit,
      status: "ATTEMPT",
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logAuditEvent({
        event: "CONVEYANCE_CREATE_FAILED",
        ...audit,
        status: "FAILED",
        reason: "VALIDATION_ERROR",
      });

      return res
        .status(400)
        .json(new ApiError(errors.array().map((e) => e.msg)));
    }

    const conveyance = new ConveyanceIndividual(req.body);
    await conveyance.save();

    logAuditEvent({
      event: "CONVEYANCE_CREATE_SUCCESS",
      ...audit,
      status: "SUCCESS",
      meta: { pnr: conveyance.pnr },
    });

    res
      .status(201)
      .json(new ApiResponse(null, "Conveyance booking created successfully!"));
  } catch (error) {
    logger.error(error);

    logAuditEvent({
      event: "CONVEYANCE_CREATE_ERROR",
      ...audit,
      status: "ERROR",
      reason: error.message,
    });

    res.status(500).json(new ApiError([error.message]));
  }
}

// Get all conveyance bookings
async function getAllConveyances(req, res) {
  try {
    const conveyances = await ConveyanceIndividual.find();
    res.json(
      new ApiResponse(
        conveyances,
        "All conveyance bookings fetched successfully!"
      )
    );
  } catch (error) {
    logger.error(error);
    console.log(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

// Get a conveyance booking by ID
async function getConveyanceById(req, res) {
  try {
    const conveyance = await ConveyanceIndividual.findOne({
      pnr: req.params.id,
    });

    const finaldetails = {
      pnr: conveyance.pnr,
      pickupDateTime: conveyance.initialpickupdateandtime,
      pickupLocation: conveyance.initiallocation,
      dropOffDateTime: conveyance.finaldropoffdateandtime,
      dropOffLocation: conveyance.finaldropofflocation,
    };

    const conveyanceDetails = conveyance.conveyancedetails.map((item) => ({

      ind_id: item._id,
      pickupDateTime: item.pickupdateandtime,
      pickupLocation: item.pickuplocation,
      dropOffDateTime: item.dropoffdateandtime,
      dropOffLocation: item.dropofflocation,
      driverName: item.drivername,
      vehicleNo: item.vehicleno,
      vehicleType: item.vehicletype,
      driverContact: item.drivercontact,
      bookedBy: item.bookedby,
      bookedFor: item.bookedfor,
      remarks: item.remarks,
      status: item.status,
    }));

    if (!conveyance) {
      return res
        .status(404)
        .json(new ApiError(["Conveyance booking not found"]));
    }
    res.json(
      new ApiResponse(
        { conveyanceDetails, finaldetails },
        "Conveyance booking fetched successfully!"
      )
    );
  } catch (error) {
    logger.error(error);
    console.log(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

// Update a conveyance booking by ID
// async function updateConveyance(req, res) {
//   try {
//     const conveyancedetails = req.body.map((item) => {
//       if (item.driverContact != " ") {
//         return {
//           pickupdateandtime: item.pickupDateTime,
//           pickuplocation: item.pickupLocation,
//           dropoffdateandtime: item.dropOffDateTime,
//           dropofflocation: item.dropOffLocation,
//           drivername: item.driverName,
//           vehicleno: item.vehicleNo,
//           vehicletype: item.vehicleType,
//           drivercontact: item.driverContact,
//           bookedby: item.bookedBy,
//           bookedfor: item.bookedFor,
//           remarks: item.remarks,
//           status: "Planned",
//         };
//       }
//       return {
//         pickupdateandtime: item.pickupDateTime,
//         pickuplocation: item.pickupLocation,
//         dropoffdateandtime: item.dropOffDateTime,
//         dropofflocation: item.dropOffLocation,
//         drivername: " ",
//         vehicleno: " ",
//         vehicletype: " ",
//         drivercontact: " ",
//         bookedby: " ",
//         bookedfor: " ",
//         remarks: " ",
//         status: "Pre-Planned",
//       };
//     });

//     const errors = validationResult(conveyancedetails);
//     if (!errors.isEmpty()) {
//       return res
//         .status(400)
//         .json(new ApiError(errors.array().map((error) => error.msg)));
//     }

//     const conveyance = await ConveyanceIndividual.findOneAndUpdate(
//       { pnr: req.params.id },
//       { $set: { conveyancedetails: conveyancedetails } },
//       { new: true }
//     );
//     if (!conveyance) {
//       return res
//         .status(404)
//         .json(new ApiError(["Conveyance booking not found"]));
//     }
//     res.json(
//       new ApiResponse(conveyance, "Conveyance booking updated successfully!")
//     );
//   } catch (error) {
//     logger.error(error);
//     console.log(error);
//     res.status(500).json(new ApiError([error.message]));
//   }
// }

async function updateConveyance(req, res) {
  const audit = getAuditContext(req);
  const pnr = req.params.id;

  try {
    logAuditEvent({
      event: "CONVEYANCE_UPDATE_ATTEMPT",
      ...audit,
      status: "ATTEMPT",
      meta: { pnr },
    });

    let payload = req.body;
    if (Array.isArray(payload)) {
      payload = { conveyancedetails: payload };
    }

    const conveyancedetails = payload.conveyancedetails.map((item) => {
      const hasDriverInfo = item.driverContact?.trim() !== "";
      return {
        pickupdateandtime: item.pickupDateTime,
        pickuplocation: item.pickupLocation,
        dropoffdateandtime: item.dropOffDateTime,
        dropofflocation: item.dropOffLocation,
        drivername: hasDriverInfo ? item.driverName : " ",
        vehicleno: hasDriverInfo ? item.vehicleNo : " ",
        vehicletype: hasDriverInfo ? item.vehicleType : " ",
        drivercontact: hasDriverInfo ? item.driverContact : " ",
        bookedby: hasDriverInfo ? item.bookedBy : " ",
        bookedfor: hasDriverInfo ? item.bookedFor : " ",
        remarks: hasDriverInfo ? item.remarks : " ",
        status: hasDriverInfo ? "Planned" : "Pre-Planned",
      };
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logAuditEvent({
        event: "CONVEYANCE_UPDATE_FAILED",
        ...audit,
        status: "FAILED",
        reason: "VALIDATION_ERROR",
        meta: { pnr },
      });

      return res
        .status(400)
        .json(new ApiError(errors.array().map((e) => e.msg)));
    }

    const conveyance = await ConveyanceIndividual.findOneAndUpdate(
      { pnr },
      { $set: { conveyancedetails } },
      { new: true, runValidators: true }
    );

    if (!conveyance) {
      logAuditEvent({
        event: "CONVEYANCE_UPDATE_FAILED",
        ...audit,
        status: "FAILED",
        reason: "PNR_NOT_FOUND",
        meta: { pnr },
      });

      return res.status(404).json(new ApiError(["Conveyance booking not found."]));
    }

    logAuditEvent({
      event: "CONVEYANCE_UPDATE_SUCCESS",
      ...audit,
      status: "SUCCESS",
      meta: { pnr },
    });

    res
      .status(200)
      .json(new ApiResponse(conveyance, "Conveyance booking updated successfully!"));
  } catch (error) {
    logger.error(error);

    logAuditEvent({
      event: "CONVEYANCE_UPDATE_ERROR",
      ...audit,
      status: "ERROR",
      reason: error.message,
      meta: { pnr },
    });

    res.status(500).json(new ApiError([error.message]));
  }
}


// Delete a conveyance booking by ID
async function deleteConveyance(req, res) {
  try {
    const conveyance = await ConveyanceIndividual.findByIdAndDelete(
        {pnr: req.params.id}
    );
    if (!conveyance) {
      return res
        .status(404)
        .json(new ApiError(["Conveyance booking not found"]));
    }
    res.json(new ApiResponse(null, "Conveyance booking deleted successfully!"));
  } catch (error) {
    logger.error(error);
    console.log(error);
    res.status(500).json(new ApiError([error.message]));
  }
}


async function deleteConveyanceRecord(req, res) {
  const audit = getAuditContext(req);
  const { pnr, indId } = req.params;

  try {
    logAuditEvent({
      event: "CONVEYANCE_RECORD_DELETE_ATTEMPT",
      ...audit,
      status: "ATTEMPT",
      meta: { pnr, recordId: indId },
    });

    const conveyance = await ConveyanceIndividual.findOneAndUpdate(
      { pnr },
      { $pull: { conveyancedetails: { _id: indId } } },
      { new: true }
    );

    if (!conveyance) {
      logAuditEvent({
        event: "CONVEYANCE_RECORD_DELETE_FAILED",
        ...audit,
        status: "FAILED",
        reason: "PNR_NOT_FOUND",
        meta: { pnr, recordId: indId },
      });

      return res.status(404).json({ message: "PNR not found" });
    }

    logAuditEvent({
      event: "CONVEYANCE_RECORD_DELETE_SUCCESS",
      ...audit,
      status: "SUCCESS",
      meta: { pnr, recordId: indId },
    });

    res
      .status(200)
      .json(new ApiResponse(conveyance, "Conveyance record deleted successfully."));
  } catch (error) {
    logger.error(error);

    logAuditEvent({
      event: "CONVEYANCE_RECORD_DELETE_ERROR",
      ...audit,
      status: "ERROR",
      reason: error.message,
      meta: { pnr, recordId: indId },
    });

    res.status(500).json(new ApiError([error.message]));
  }
}



module.exports = {
  createConveyance,
  getAllConveyances,
  getConveyanceById,
  updateConveyance,
  deleteConveyance,
  deleteConveyanceRecord,
};
