const VisitsModel = require("../models/Visits.model");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const fs = require('fs');
const path = require('path');
const { OrgVisitDetailsMail } = require("../utils/email/OrgApproveMail");
const { IndVisitDetailsMail } = require("../utils/email/IndApprovelMail");
const { cancellationMail } = require("../utils/email/cancellationMail");
const { visitStatusEnums } = require("../enums");
const {logger} = require("../configs/logger");
const { logAuditEvent } = require("../configs/audit");

async function approvalIndividualDetails(req, res) {
  try {
    const visit = await VisitsModel.findOne({
      pnr: req.params.id,
    });

    if (!visit)
      return res
        .status(400)
        .json(new ApiError(["Individual visit details not found."]));

    const resObj = {
      visitorName: `${visit.visitorfirstname} ${visit.visitorlastname}`,
      organisation: visit.visitororganization,
      purpose: visit.purpose,
      contact: visit.visitorcontactno,
      email: visit.visitoremail,
      visitStart: visit.visitstart,
      visitEnd: visit.visitend,
      visitStatus: visit.visitstatus,
      approveByHost: visit.approvedByHost,
      priority: visit.priority,
      visitend: visit.visitend,
      hostName: visit.hostname,
    };
  
    return res.status(200).json(new ApiResponse(resObj, "msg"));
  } catch (error) {
    logger.error(error);
    console.log(error);
    res.status(500).json(new ApiError([error.message]));
  }
}



// async function approvalIndividual(req, res) {
//   try {
//     const updateResult = await VisitsModel.findOneAndUpdate(
//       { pnr: req.params.id },
//       { approvedByHost: true, visitstatus: visitStatusEnums[1], visitLink : req.body.qrData },
//       { new: true }
//     );

//     if (!updateResult)
//       return res
//         .status(400)
//         .json(new ApiError(["Individual visit details not found."]));

//     const visitdetails = await VisitsModel.findOne({ pnr: req.params.id });
//     console.log("visitdetails result", visitdetails);
//     //Mail Logic
//     const ApprovalMailObject = {
//       pnr: req.params.id,
//       email: visitdetails.visitoremail,
//       hostname: visitdetails.hostname,
//       firstName: visitdetails.visitorfirstname,
//       lastName: visitdetails.visitorlastname,
//       date: visitdetails.visitstart,
//       date1: visitdetails.visitend,
//       hostemail: visitdetails.hostemail,
//       purpose: visitdetails.purpose,
//     };
//     let mailrespopnse = await IndVisitDetailsMail(
//       ApprovalMailObject,
//       req.body?.base64Data
//     );
//     console.log("Approved Mail Ind Response", mailrespopnse);

//     return res
//       .status(200)
//       .json(new ApiResponse(null, "Individual visit approved successfully."));
//   } catch (error) {
//     console.error(error);
//     res.status(500).json(new ApiError([error.message]));
//   }
// }

async function approvalIndividual(req, res) {
  try {
    const pnr = req.params.id;
    const userEmail = req.user?.email;

    // 1️⃣ Fetch visit (lean for speed)
    const visit = await VisitsModel.findOne({ pnr }).lean();

    if (!visit) {
      return res
        .status(404)
        .json(new ApiError(["Individual visit details not found."]));
    }

    // 2️⃣ Authorization check
    if (visit.hostemail !== userEmail) {
      logAuditEvent({
        event: "VISIT_APPROVAL_UNAUTHORIZED",
        pnr,
        userId: req.userContext.userId,
      userRole: req.userContext.roleName,
        status: "DENIED"
      });

      return res
        .status(403)
        .json(new ApiError(["You are not authorized to approve this visit."]));
    }

    // 3️⃣ Idempotency checks
    if (visit.visitstatus === "Cancelled") {
      return res
        .status(409)
        .json(new ApiError(["Cancelled visits cannot be approved."]));
    }

    if (visit.approvedByHost === true) {
      return res
        .status(409)
        .json(new ApiError(["Visit already approved."]));
    }

    // 4️⃣ Atomic update (race-condition safe)
    const updatedVisit = await VisitsModel.findOneAndUpdate(
      {
        pnr,
        approvedByHost: false,
        visitstatus: { $ne: "Cancelled" }
      },
      {
        approvedByHost: true,
        visitstatus: visitStatusEnums[1], // Approved
        visitLink: req.body.qrData,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!updatedVisit) {
      return res
        .status(409)
        .json(new ApiError(["Visit already processed."]));
    }

    // 5️⃣ Audit success
    logAuditEvent({
      event: "VISIT_APPROVED",
      pnr,
      userId: req.userContext.userId,
      userRole: req.userContext.roleName,
      status: "SUCCESS"
    });

    // 6️⃣ Respond immediately (email async)
    res
      .status(200)
      .json(new ApiResponse(null, "Individual visit approved successfully."));

    // 7️⃣ Send email asynchronously (NO DUPLICATES)
    setImmediate(async () => {
      try {
        const mailPayload = {
          pnr,
          email: updatedVisit.visitoremail,
          hostname: updatedVisit.hostname,
          firstName: updatedVisit.visitorfirstname,
          lastName: updatedVisit.visitorlastname,
          date: updatedVisit.visitstart,
          date1: updatedVisit.visitend,
          hostemail: updatedVisit.hostemail,
          purpose: updatedVisit.purpose
        };

        await IndVisitDetailsMail(mailPayload, req.body?.base64Data);
      } catch (err) {
        logger.error("Approval mail error:", err);
      }
    });

  } catch (error) {
    logger.error(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

async function cancelationIndividual(req, res) {
  try {
    const pnr = req.params.id;
    const userEmail = req.user?.email;

    // 1️⃣ Fetch visit
    const visit = await VisitsModel.findOne({ pnr }).lean();

    if (!visit) {
      return res
        .status(404)
        .json(new ApiError(["Individual visit details not found."]));
    }

    // 2️⃣ Authorization check
    // if (visit.hostemail !== userEmail) {
    //   logAuditEvent({
    //     event: "VISIT_CANCELLATION_UNAUTHORIZED",
    //     pnr,
    //     performedBy: userEmail,
    //     status: "DENIED"
    //   });

    //   return res
    //     .status(403)
    //     .json(new ApiError(["You are not authorized to cancel this visit."]));
    // }

    // 3️⃣ Idempotency check
    if (visit.visitstatus === "Cancelled") {
      return res
        .status(409)
        .json(new ApiError(["Visit already cancelled."]));
    }

    // 4️⃣ Atomic cancellation
    const updatedVisit = await VisitsModel.findOneAndUpdate(
      {
        pnr,
        visitstatus: { $ne: "Cancelled" }
      },
      {
        approvedByHost: false,
        visitstatus: "Cancelled",
        cancelledAt: new Date()
      },
      { new: true }
    );

    if (!updatedVisit) {
      return res
        .status(409)
        .json(new ApiError(["Visit already cancelled."]));
    }

    // 5️⃣ Audit success
    logAuditEvent({
      event: "VISIT_CANCELLED",
      pnr,
      userId: req.userContext.userId,
      userRole: req.userContext.roleName,
      status: "SUCCESS"
    });

    // 6️⃣ Respond immediately
    res
      .status(200)
      .json(new ApiResponse(null, "Individual visit cancelled."));

    // 7️⃣ Send cancellation email async
    setImmediate(async () => {
      try {
        await cancellationMail(updatedVisit);
      } catch (err) {
        logger.error("Cancellation mail error:", err);
      }
    });

  } catch (error) {
    logger.error(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

// async function cancelationIndividual(req, res) {
//   try {
//     const updatedVisit = await VisitsModel.findOneAndUpdate(
//       { pnr: req.params.id },
//       { approvedByHost: false, visitstatus: "Cancelled" },
//       { new: true }
//     );

//     if (!updatedVisit)
//       return res
//         .status(400)
//         .json(new ApiError(["Individual visit details not found."]));

//     await cancellationMail(updatedVisit);

//     return res
//       .status(200)
//       .json(new ApiResponse(null, "Individual visit cancelled."));
//   } catch (error) {
//     console.error(error);
//     res.status(500).json(new ApiError([error.message]));
//   }
// }



module.exports = {
  approvalIndividualDetails,
  approvalIndividual,
  cancelationIndividual,
};
