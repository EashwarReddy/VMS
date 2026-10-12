const { validationResult } = require("express-validator");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const VisitIndividual = require("../models/Visits.model");
const Accommodation = require("../models/Accomodation.model");
const Conveyance = require("../models/Conveyanceindividual.model");
const { v4: uuidv4 } = require("uuid");
const {
  IndVisitPendingApprovalMail,
  IndVisitApprovalMail,
} = require("../utils/email/IndInitialMail");

const jwt = require("jsonwebtoken");
const { default: axios } = require("axios");
const { maskGovtId, maskPhone } = require('../utils/mask');
const {logger} = require("../configs/logger");
const { logAuditEvent } = require("../configs/audit");

// Generate a unique PNR
const generateUniquePNR = () => {
  // Generate a v4 UUID
  const uuid = uuidv4().replace(/-/g, ""); // Remove dashes from the generated UUID
  const alphaPart = uuid.substring(0, 4);
  const numericPart = uuid.substring(4, 8);

  // Ensure that the PNR is at least 8 characters long
  const paddedNumericPart = numericPart.padEnd(8, "0");

  const pnr = `${alphaPart}${paddedNumericPart}`;
  return pnr; // Generate a version 4 (random) UUID
};

const yup = require("yup");
const referenceEmailSchema = yup.string()
.email("Invalid office email address")
.required("office email is required")
.test("cdac-only", "office email must be from @cdac.in", (value) => {
  return value && value.endsWith("@cdac.in");
});

// Create a new visit
async function createVisit(req, res) {
  console.log('entering into function');
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(new ApiError(errors.array().map((error) => error.msg)));
    }

logAuditEvent({
  event: "VISIT_CREATE_ATTEMPT",
  user: "[REDACTED_EMAIL]",
  status: "STARTED",
  userId: req.userContext.userId,
  userRole: req.userContext.roleName,
  ip: req.ip,
  url: req.url,
});



    // ================= COOLDOWN WINDOW CHECK =================
const COOLDOWN_MS = 1* 60 * 1000; // 10 minutes
if (req.body.draft === false) {
const recentSubmission = await VisitIndividual.findOne({
  submittedby: req.body.submittedby,
  createdAt: { $gte: new Date(Date.now() - COOLDOWN_MS) }
}).select("_id createdAt");

if (recentSubmission) {

   // 🔐 AUDIT LOG — BLOCKED BY COOLDOWN
   logAuditEvent({
    event: "VISIT_CREATE_BLOCKED_COOLDOWN", 
    user:"[REDACTED_EMAIL]",
    status: "BLOCKED",
    userId: req.userContext.userId,
    userRole: req.userContext.roleName,
    ip: req.ip,
      url: req.url,
    meta: {
      windowMinutes: 10,
      lastSubmissionAt: recentSubmission.createdAt
    }
  });


  return res.status(429).json(
    new ApiError([
      "You have recently submitted a visit request. Please wait 1 minutes before submitting again."
    ])
  );
}
}
// ========================================================

  
    const { arrivalDateTime, departureDateTime, email } = req.body;

    await referenceEmailSchema.validate(req.body.officeemail);
  
    // ✅ Convert input (assumed local) to UTC
    const toUTC = (str) => {
      const date = new Date(str);
      const offset = date.getTimezoneOffset() * 60000; // in ms
      return new Date(date.getTime() - offset);
    };
  
    const arrival = toUTC(arrivalDateTime);
    const departure = toUTC(departureDateTime);
  
    // ✅ Check for overlapping visits for the same visitor (by email)
    const overlappingVisit = await VisitIndividual.findOne({
      visitoremail: email,
      $or: [
        {
          visitstart: { $lte: arrival },
          visitend: { $gte: arrival }
        },
        {
          visitstart: { $lte: departure },
          visitend: { $gte: departure }
        },
        {
          visitstart: { $gte: arrival },
          visitend: { $lte: departure }
        },
        {
          visitstart: { $lte: arrival },
          visitend: { $gte: departure }
        }
      ]
    });
    if (overlappingVisit) {
      return res.status(400).json(
        new ApiError(["The new visit time overlaps with a previous visit. Please choose a different time."])
      );
    }
  
    let generatedpnr = generateUniquePNR();
    const file = req.file;
  
    function generateTokenforVerify(payload) {
      const expiresIn = departure.getTime() - Date.now();
      return jwt.sign(payload, `${process.env.VERIFYQRSECRET}`, {
        algorithm: "HS256",
        expiresIn,
      });
    }
  
    const tokenpayload = {
      pnr: generatedpnr,
      visitstart: arrival.toISOString(),
      visitend: departure.toISOString(),
      isAccomodationRequired: req.body.isStaying,
      isTravelRequired: req.body.isTraveling,
      visitorfirstname: req.body.firstName,
      visitorlastname: req.body.lastName,
      visitorgender: req.body.gender,
      image: file.filename,
      visitorcontactno: req.body.contact,
      visitoremail: email,
      visitortype: req.body.visitorType,
      visitorpincode: req.body.pincode,
      visitorstate: req.body.state,
      visitordistrict: req.body.district,
      visitoraddress: req.body.address,
      visitororganization: req.body.organization,
      visitoridtype: req.body.govtIdType,
      visitortidno: req.body.govtIdNumber,
      hostname: req.body.employee,
      hostemail: req.body.officeemail,
      hostcontact: req.body.phoneNumber,
      hostdepartment: req.body.deptName,
      purpose: req.body.purpose,
      submittedby: req.body.submittedby,
    };
  
    let verifyqrtoken = generateTokenforVerify(tokenpayload);
    let verifyqrlink = `${process.env.VERIFYURL}/${generatedpnr}/${verifyqrtoken}`;
  

    const Visitdetails = {
      ...tokenpayload,
      draft: req.body.draft,
      verifyqrlink: verifyqrlink,
      visitType: 'Ind',
      visitstart: arrival,
      visitend: departure
    };
  
    const visit = new VisitIndividual(Visitdetails);
    await visit.save();

    logAuditEvent({
      event: "VISIT_CREATED",
      user: "[REDACTED_EMAIL]",
      pnr: generatedpnr,
      userId: req.userContext.userId,
      userRole: req.userContext.roleName,
      ip: req.ip,
      url: req.url,
      status: "SUCCESS"
    });
    

  

    //Logic Stuff

    // Accomodation Only

    if (req.body.isStaying === true  &&  req.body.isTraveling === false) {
      console.log('inside only accomodation creation')
      let accommodationData = {
        pnr: generatedpnr,
        arrivaldateandtime: req.body.accFromDate,
        departuredateandtime: req.body.accToDate,
        submittedby: req.body.submittedby,
        draft: req.body.draft,
      };

      const accommodation = new Accommodation(accommodationData);
      await accommodation.save();
      console.log("🚀 Accomodation Created Successfully");
    }

    // // Conveyance Only
    else if (req.body.isTraveling === true && req.body.isStaying === false) {
      console.log('inside only conveyance creation')
      req.body.localConveyanceEntries = JSON.parse(req.body.localConveyanceEntries)
      // Extract pickupdateandtime and pickuplocation from the first object
      console.log("req.body.localConveyanceEntries[0]...........",req.body.localConveyanceEntries[0])
      const { pickupDateTime, pickupLocation } =
        req.body.localConveyanceEntries[0];

      // Extract dropofflocation and dropoffDateTime from the last object
      const lastEntry =
        req.body.localConveyanceEntries[
          req.body.localConveyanceEntries.length - 1
        ];

        console.log("lastEntry.....................",lastEntry)
      const { dropoffLocation, dropoffDateTime } = lastEntry;

      const conveyancedetails = req.body.localConveyanceEntries.map((item) => ({
        pickupdateandtime: item.pickupDateTime,
        pickuplocation: item.pickupLocation,
        dropoffdateandtime: item.dropoffDateTime,
        dropofflocation: item.dropoffLocation,
        drivername: " ",
        vehicleno: " ",
        vehicletype: " ",
        drivercontact: " ",
        bookedby: " ",
        bookedfor: " ",
        remarks: " ",
        status: "Pre-Planned",
      }));

      if (req.body.localConveyanceEntries.length > 1) {
        var conveyanceData = {
          pnr: generatedpnr,
          initialpickupdateandtime: pickupDateTime,
          initiallocation: pickupLocation,
          finaldropoffdateandtime: dropoffDateTime,
          finaldropofflocation: dropoffLocation,
          conveyancedetails: conveyancedetails,
          submittedby: req.body.submittedby,
          draft: req.body.draft,
        };
      } else {
        var conveyanceData = {
          pnr: generatedpnr,
          initialpickupdateandtime: pickupDateTime,
          initiallocation: pickupLocation,
          finaldropoffdateandtime:
            req.body.localConveyanceEntries[0].dropoffDateTime,
          finaldropofflocation:
            req.body.localConveyanceEntries[0].dropoffLocation,
          conveyancedetails: [
            {
              pickupdateandtime: pickupDateTime,
              pickuplocation: pickupLocation,
              dropoffdateandtime:
                req.body.localConveyanceEntries[0].dropoffDateTime,
              dropofflocation:
                req.body.localConveyanceEntries[0].dropoffLocation,
              drivername: " ",
              vehicleno: " ",
              vehicletype: " ",
              drivercontact: " ",
              bookedby: " ",
              bookedfor: " ",
              remarks: " ",
              status: "Pre-Planned",
            },
          ],
          submittedby: req.body.submittedby,
          draft: req.body.draft,
        };
      }

      const conveyance = new Conveyance(conveyanceData);
      await conveyance.save();
      console.log("🚀 Conveyance Created Successfully");
    }


    else if (req.body.isTraveling === true && req.body.isStaying === true ) {
      console.log('inside both creations')

      let accommodationData = {
        pnr: generatedpnr,
        arrivaldateandtime: req.body.accFromDate,
        departuredateandtime: req.body.accToDate,
        submittedby: req.body.submittedby,
        draft: req.body.draft,
      };

      const accommodation = new Accommodation(accommodationData);
      await accommodation.save();
      console.log("🚀 Accomodation Created Successfully");
req.body.localConveyanceEntries = JSON.parse(req.body.localConveyanceEntries)
      let conveyanceData = {
        pnr: generatedpnr,
        initialpickupdateandtime:
          req.body.localConveyanceEntries[0].pickupDateTime,
        initiallocation: req.body.localConveyanceEntries[0].pickupLocation,
        finaldropoffdateandtime:
          req.body.localConveyanceEntries[0].dropoffDateTime,
        finaldropofflocation:
          req.body.localConveyanceEntries[0].dropoffLocation,
        submittedby: req.body.submittedby,
        draft: req.body.draft,
      };

      const conveyance = new Conveyance(conveyanceData);
      await conveyance.save();
      console.log("🚀 Conveyance Created Successfully");
    }
    await res
      .status(201)
      .json(new ApiResponse(null, "Visit created successfully!"));
  } catch (error) {
    logger.error(error);
    console.error(error);
    await res.status(500).json(new ApiError([error.message]));
  }

}

// Get all visits
async function getAllVisits(req, res) {
  try {
    const visits = await VisitIndividual.find({
      draft: false,
    });
    const visitDetails = visits.map((visit, index) => {
      return {
        pnr: visit.pnr,
        arrivalDateTime: visit.visitstart,
        departureDateTime: visit.visitend,
        isStaying: visit.isAccomodationRequired,
        isTraveling: visit.isTravelRequired,
        firstName: visit.visitorfirstname,
        lastName: visit.visitorlastname,
        gender: visit.visitorgender,
        pnr: visit.pnr,
        visitstart: visit.arrivalDateTime,
        visitend: visit.departureDateTime,
        isAccomodationRequired: visit.isStaying,
        isTravelRequired: visit.isTraveling,
        visitorfirstname: visit.firstName,
        visitorlastname: visit.lastName,
        visitorgender: visit.gender,
        // visitorage: visit.age,
        visitorcontactno: maskPhone(visit.contact),
        visitoremail: visit.email,
        visitortype: visit.visitortype,
        visitorpincode: visit.pincode,
        visitorstate: visit.state,
        visitordistrict: visit.district,
        visitoraddress: visit.address,
        visitororganization: visit.organization,
        visitoridtype: visit.govtIdType,
        visitortidno: visit.govtIdNumber,
        hostname: visit.employee,
        hostemail: visit.officeemail,
        hostcontact: maskPhone(visit.phoneNumber),
        purpose: visit.purpose,
        visitstatus: visit.visitstatus,
        // age: visit.visitorage,
        contact: maskPhone(visit.visitorcontactno),
        email: visit.visitoremail,
        pincode: visit.visitorpincode,
        state: visit.visitorstate,
        district: visit.visitordistrict,
        address: visit.visitoraddress,
        organization: visit.visitororganization,
        govtIdType: visit.visitoridtype,
        govtIdNumber: maskGovtId(visit.visitortidno),
        employee: visit.hostname,
        officeemail: visit.hostemail,
        phoneNumber: maskPhone(visit.hostcontact),
        purpose: visit.purpose,
        deptName: visit.hostdepartment,
        visitstatus: visit.visitstatus,
        draft: visit.draft,
      };
    });
    res.json(new ApiResponse(visitDetails, "All visits fetched successfully!"));
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

async function getAllPlannerVisits(req, res) {
  try {
    const visits = await VisitIndividual.find({
      draft: false,
      visitstatus: { $nin: ["Cancelled", "Failed"] }
    }).sort({ visitend: 1 });

    const visitDetails = visits.map((visit, index) => {
      return {
        pnr: visit.pnr,
        arrivalDateTime: visit.visitstart,
        departureDateTime: visit.visitend,
        isStaying: visit.isAccomodationRequired,
        isTraveling: visit.isTravelRequired,
        firstName: visit.visitorfirstname,
        lastName: visit.visitorlastname,
        gender: visit.visitorgender,
        pnr: visit.pnr,
        visitstart: visit.arrivalDateTime,
        visitend: visit.departureDateTime,
        isAccomodationRequired: visit.isStaying,
        isTravelRequired: visit.isTraveling,
        visitorfirstname: visit.firstName,
        visitorlastname: visit.lastName,
        visitorgender: visit.gender,
        // visitorage: visit.age,
        visitorcontactno: maskPhone(visit.contact),
        visitoremail: visit.email,
        visitortype: visit.visitortype,
        visitorpincode: visit.pincode,
        visitorstate: visit.state,
        visitordistrict: visit.district,
        visitoraddress: visit.address,
        visitororganization: visit.organization,
        visitoridtype: visit.govtIdType,
        visitortidno: visit.govtIdNumber,
        hostname: visit.employee,
        hostemail: visit.officeemail,
        hostcontact: maskPhone(visit.phoneNumber),
        purpose: visit.purpose,
        visitstatus: visit.visitstatus,
        // age: visit.visitorage,
        contact: maskPhone(visit.visitorcontactno),
        email: visit.visitoremail,
        pincode: visit.visitorpincode,
        state: visit.visitorstate,
        district: visit.visitordistrict,
        address: visit.visitoraddress,
        organization: visit.visitororganization,
        govtIdType: visit.visitoridtype,
        govtIdNumber: maskGovtId(visit.visitortidno),
        employee: visit.hostname,
        officeemail: visit.hostemail,
        phoneNumber: maskPhone(visit.hostcontact),
        purpose: visit.purpose,
        deptName: visit.hostdepartment,
        visitstatus: visit.visitstatus,
        draft: visit.draft,
      };
    });
    res.json(new ApiResponse(visitDetails, "All visits fetched successfully!"));
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

// async function getAllPastVisits(req, res) {
//   try {
//     const email = req.user?.email;  // Or wherever you store the logged-in host's email

//     console.log("emailghktyyyyyyyyyl:", email)
    
//     if (!email) {
//       return res.status(401).json(new ApiError(["Unauthorized: No host email provided"]));
//     }

//     const visits = await VisitIndividual.find({
//       submittedby: req.query.email // Filter for only visits belonging to this host
//     });
//     console.log("visits..........:",visits)
//     const visitDetails = visits.map((visit, index) => {
//       return {
//         pnr: visit.pnr,
//         arrivalDateTime: visit.visitstart,
//         departureDateTime: visit.visitend,
//         isStaying: visit.isAccomodationRequired,
//         isTraveling: visit.isTravelRequired,
//         firstName: visit.visitorfirstname,
//         lastName: visit.visitorlastname,
//         gender: visit.visitorgender,
//         pnr: visit.pnr,
//         visitstart: visit.arrivalDateTime,
//         visitend: visit.departureDateTime,
//         isAccomodationRequired: visit.isStaying,
//         isTravelRequired: visit.isTraveling,
//         visitorfirstname: visit.firstName,
//         visitorlastname: visit.lastName,
//         visitorgender: visit.gender,
//         // visitorage: visit.age,
//         visitorcontactno: visit.contact,
//         visitoremail: visit.email,
//         visitortype: visit.visitortype,
//         visitorpincode: visit.pincode,
//         visitorstate: visit.state,
//         visitordistrict: visit.district,
//         visitoraddress: visit.address,
//         visitororganization: visit.organization,
//         visitoridtype: visit.govtIdType,
//         visitortidno: visit.govtIdNumber,
//         hostname: visit.employee,
//         hostemail: visit.officeemail,
//         hostcontact: visit.phoneNumber,
//         purpose: visit.purpose,
//         visitstatus: visit.visitstatus,
//         // age: visit.visitorage,
//         contact: visit.visitorcontactno,
//         email: visit.visitoremail,
//         pincode: visit.visitorpincode,
//         state: visit.visitorstate,
//         district: visit.visitordistrict,
//         address: visit.visitoraddress,
//         organization: visit.visitororganization,
//         govtIdType: visit.visitoridtype,
//         govtIdNumber: visit.visitortidno,
//         employee: visit.hostname,
//         officeemail: visit.hostemail,
//         phoneNumber: visit.hostcontact,
//         purpose: visit.purpose,
//         deptName: visit.hostdepartment,
//         visitstatus: visit.visitstatus,
//         draft: visit.draft,
//       };
//     });

//     return res.json(
//       new ApiResponse(
//         visitDetails,
//         "All the completed visits fetched successfully!"
//       )
//     );
//   } catch (error) {
//     console.error(error);
//     res.status(500).json(new ApiError([error.message]));
//   }
// }


async function getAllPastVisits(req, res) {
  try {
    const email = req.user?.email;
    console.log("Host email from token:", email);

    if (!email) {
      return res
        .status(401)
        .json(new ApiError(["Unauthorized: No host email provided"]));
    }

    const visits = await VisitIndividual.find({
      visitstatus: "Completed",
      hostemail: email,
    });

    const visitDetails = visits.map((visit) => ({
      pnr: visit.pnr,
      arrivalDateTime: visit.visitstart,
      departureDateTime: visit.visitend,
      isStaying: visit.isAccomodationRequired,
      isTraveling: visit.isTravelRequired,
      firstName: visit.visitorfirstname,
      lastName: visit.visitorlastname,
      gender: visit.visitorgender,
      visitorcontactno: maskPhone(visit.visitorcontactno),   // masked
      visitoremail: visit.visitoremail,
      visitortype: visit.visitortype,
      visitorpincode: visit.visitorpincode,
      visitorstate: visit.visitorstate,
      visitordistrict: visit.visitordistrict,
      visitoraddress: visit.visitoraddress,
      visitororganization: visit.visitororganization,
      visitoridtype: visit.govtIdType,
      visitortidno: maskGovtId(visit.govtIdNumber),          // masked
      hostname: visit.hostname,
      hostemail: visit.hostemail,
      hostcontact: maskPhone(visit.phoneNumber),             // masked
      purpose: visit.purpose,
      visitstatus: visit.visitstatus,
      deptName: visit.hostdepartment,
      draft: visit.draft,
    }));

    return res.json(
      new ApiResponse(
        visitDetails,
        "All the completed visits fetched successfully!"
      )
    );
  } catch (error) {
    logger.error(error);
    console.error("Error in getAllPastVisits:", error);
    res.status(500).json(new ApiError([error.message]));
  }
}

async function getAllPlannerPastVisits(req, res) {
  try {
    const email = req.user?.email;
    console.log("Host email from token:", email);

    if (!email) {
      return res
        .status(401)
        .json(new ApiError(["Unauthorized: No host email provided"]));
    }

    const now = new Date();
    console.log("todAY:..........",now)


    const visits = await VisitIndividual.aggregate([

      {
        $match: {
          visitend: { $lt: now }, 
          visitstatus: { $nin: ["Cancelled"]}
        }
      },

      // 1️⃣ Join accommodation collection
      {
        $lookup: {
          from: "accomodationindividuals",
          localField: "pnr",
          foreignField: "pnr",
          as: "accomodation"
        }
      },
    
      // 2️⃣ Join conveyance collection
      {
        $lookup: {
          from: "conveyanceindividuals",
          localField: "pnr",
          foreignField: "pnr",
          as: "conveyance"
        }
      },
    
      // 3️⃣ Keep only visits where accommodation OR conveyance details exist
      {
        $match: {
          $or: [
            {
              "accomodation.accomodationdetails": {
                $exists: true,
                $ne: []
              }
            },
            {
              "conveyance.conveyancedetails": {
                $exists: true,
                $ne: []
              }
            }
          ]
        }
      },
    
      {
        $sort: { visitend: 1 }
      },
      // 4️⃣ (Optional) Return only VisitIndividual fields
      {
        $project: {
          accomodation: 0,
          conveyance: 0
        }
      }
    ]);
    
    
    //console.log("visits...",visits)

    const visitDetails = visits.map((visit) => ({
      pnr: visit.pnr,
      arrivalDateTime: visit.visitstart,
      departureDateTime: visit.visitend,
      isStaying: visit.isAccomodationRequired,
      isTraveling: visit.isTravelRequired,
      firstName: visit.visitorfirstname,
      lastName: visit.visitorlastname,
      gender: visit.visitorgender,
      visitorcontactno: maskPhone(visit.visitorcontactno),   // masked
      visitoremail: visit.visitoremail,
      visitortype: visit.visitortype,
      visitorpincode: visit.visitorpincode,
      visitorstate: visit.visitorstate,
      visitordistrict: visit.visitordistrict,
      visitoraddress: visit.visitoraddress,
      visitororganization: visit.visitororganization,
      visitoridtype: visit.govtIdType,
      visitortidno: maskGovtId(visit.govtIdNumber),          // masked
      hostname: visit.hostname,
      hostemail: visit.hostemail,
      hostcontact: maskPhone(visit.phoneNumber),             // masked
      purpose: visit.purpose,
      visitstatus: visit.visitstatus,
      deptName: visit.hostdepartment,
      draft: visit.draft,
    }));

    return res.json(
      new ApiResponse(
        visitDetails,
        "All the Planner Past Visits fetched successfully!"
      )
    );
  } catch (error) {
    logger.error(error);
    console.error("Error in getAllPlannerPastVisits:", error);
    res.status(500).json(new ApiError([error.message]));
  }
}

async function getVisitById(req, res) {
  try {

    const { id } = req.params;

    // ✅ Basic validation
    if (!/^[A-Za-z0-9-_]+$/.test(id)) {
      return res.status(400).json(new ApiError(["Invalid visit ID format"]));
    }

    const visit = await VisitIndividual.findOne({ pnr: id }).lean();
    if (!visit) {
      return res.status(404).json(new ApiError(["Visit not found by ID"]));
    }

    const Visitdetails = {
      pnr: visit.pnr,
      arrivalDateTime: visit.visitstart,
      departureDateTime: visit.departureDateTime,
      isStaying: visit.isAccomodationRequired,
      isTraveling: visit.isTravelRequired,
      firstName: visit.visitorfirstname,
      lastName: visit.visitorlastname,
      gender: visit.visitorgender,
      // age: visit.visitorage,
      contact: maskPhone(visit.visitorcontactno),
      email: visit.visitoremail,
      visitortype: visit.visitortype,
      pincode: visit.visitorpincode,
      state: visit.visitorstate,
      district: visit.visitordistrict,
      address: visit.visitoraddress,
      organization: visit.visitororganization,
      govtIdType: visit.visitoridtype,
      govtIdNumber: maskGovtId(visit.visitortidno),
      employee: visit.hostname,
      officeemail: visit.hostemail,
      phoneNumber: maskPhone(visit.hostcontact),
      deptName: visit.hostdepartment,
      purpose: visit.purpose,
      draft: visit.draft,
    };
    res.json(new ApiResponse(Visitdetails, "Visit fetched successfully!"));
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

const Joi = require("joi");

const visitSchema = Joi.object({
  email: Joi.string().email().required()
});

// Get a single visit by Email
async function getVisitByEmail(req, res) {
  try {
    const { error } = visitSchema.validate({ email: req.query.email });
    if (error) {
      return res.status(400).json(new ApiError(["Invalid email format"]));
    }
    console.log("🚀 ~ getVisitByEmail ~ req.query.email:", req.query.email)
    const visit = await VisitIndividual.find({ submittedby: req.query.email }).sort({ visitend: 1 });
    if (!visit) {
      return res.status(404).json(new ApiError(["Visit not found by email"]));
    }

    const Visitdetails = visit.map((item) => ({
      pnr: item.pnr,
      arrivalDateTime: item.visitstart,
      departureDateTime: item.visitend,
      isStaying: item.isAccomodationRequired,
      isTraveling: item.isTravelRequired,
      firstName: item.visitorfirstname,
      lastName: item.visitorlastname,
      gender: item.visitorgender,
      // age: item.visitorage,
      contact: maskPhone(item.visitorcontactno),
      email: item.visitoremail,
      visitortype: item.visitortype,
      pincode: item.visitorpincode,
      state: item.visitorstate,
      district: item.visitordistrict,
      address: item.visitoraddress,
      organization: item.visitororganization,
      govtIdType: item.visitoridtype,
      govtIdNumber: maskGovtId(item.visitortidno),
      employee: item.hostname,
      officeemail: item.hostemail,
      phoneNumber: maskPhone(item.hostcontact),
      deptName: item.hostdepartment,
      purpose: item.purpose,
      visitstatus: item.visitstatus,
      draft: item.draft,
    }));
    res.json(new ApiResponse(Visitdetails, "Visit fetched successfully!"));
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

// Update a visit by ID
// async function updateVisit(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(400)
//         .json(new ApiError(errors.array().map((error) => error.msg)));
//     }

//     console.log("req.body: ", req.body);

//     // Generate JWT token
//     function generateTokenforVerify(payload) {
//       // Parse visitEnd to obtain a Date object
//       const visitEndTime = new Date(req.body.departureDateTime);

//       // Calculate expiry duration in milliseconds
//       const expiresIn = visitEndTime.getTime() - Date.now();
//       return jwt.sign(payload, `${process.env.VERIFYQRSECRET}`, {
//         algorithm: "HS256",
//         expiresIn,
//       });
//     }

//     const tokenpayload = {
//       pnr: req.params.id,
//       visitstart: req.body.arrivalDateTime,
//       visitend: req.body.departureDateTime,
//       isAccomodationRequired: req.body.isStaying,
//       isTravelRequired: req.body.isTraveling,
//       visitorfirstname: req.body.firstName,
//       visitorlastname: req.body.lastName,
//       visitorgender: req.body.gender,
//       // visitorage: req.body.age,
//       visitorcontactno: req.body.contact,
//       visitoremail: req.body.email,
//       visitortype: req.body.visitortype,
//       visitorpincode: req.body.pincode,
//       visitorstate: req.body.state,
//       visitordistrict: req.body.district,
//       visitoraddress: req.body.address,
//       visitororganization: req.body.organization,
//       visitoridtype: req.body.govtIdType,
//       visitortidno: req.body.govtIdNumber,
//       hostname: req.body.employee,
//       hostemail: req.body.officeemail,
//       hostcontact: req.body.phoneNumber,
//       hostdepartment: req.body.deptName,
//       purpose: req.body.purpose,
//       submittedby: req.body.submittedby,
//     };

//     let verifyqrtoken = generateTokenforVerify(tokenpayload);
//     let verifyqrlink = `${process.env.VERIFYURL}/${req.params.id}/${verifyqrtoken}`;
//     const Visitdetails = {
//       ...tokenpayload,
//       verifyqrlink: verifyqrlink,
//       draft: req.body.draft,
//     };

//     // Visit Update
//     const visit = await VisitIndividual.findOneAndUpdate(
//       { pnr: req.params.id },
//       {
//         $set: {
//           ...Visitdetails,
//         },
//       },
//       { new: true }
//     );

//     // Accomodation Update
//     if (req.body.isStaying == false) {
//       const accomodation = await Accommodation.findOneAndDelete({
//         pnr: req.params.id,
//       });
//       if (!accomodation) {
//         console.log("Visit Accomodation not found");
//       }
//       console.log("Visit Accomodation deleted successfully!");
//     } else {
//       const accomodationfind = await Accommodation.find({ pnr: req.params.id });

//       if (accomodationfind.length == 0) {
//         let accommodationData = {
//           pnr: req.params.id,
//           arrivaldateandtime: req.body.accFromDate,
//           departuredateandtime: req.body.accToDate,
//           submittedby: req.body.submittedby,
//           draft: req.body.draft,
//         };

//         const accommodation = new Accommodation(accommodationData);
//         await accommodation.save();
//         console.log("🚀 Accomodation Created Successfully");
//       } else {
//         const accommodation = await Accommodation.findOneAndUpdate(
//           { pnr: req.params.id },
//           {
//             $set: {
//               arrivaldateandtime: req.body.accFromDate,
//               departuredateandtime: req.body.accToDate,
//               submittedby: req.body.submittedby,
//               draft: req.body.draft,
//             },
//           },
//           { new: true }
//         );

//         console.log("🚀 Accomodation Updated Successfully", accommodation);
//       }
//     }

//     // Conveyance Update
//     if (req.body.isTraveling == false) {
//       const conveyance = await Conveyance.findOneAndDelete({
//         pnr: req.params.id,
//       });
//       if (!conveyance) {
//         console.log("Visit Conveyance not found");
//       }
//       console.log("Visit Conveyance deleted successfully!");
//     } else {
//       const conveyancefind = await Conveyance.find({ pnr: req.params.id });

//       if (conveyancefind.length == 0) {
//         // Extract pickupdateandtime and pickuplocation from the first object
//         const { pickupDateTime, pickupLocation } =
//           req.body.localConveyanceEntries[0];

//         // Extract dropofflocation and dropoffDateTime from the last object
//         const lastEntry =
//           req.body.localConveyanceEntries[
//             req.body.localConveyanceEntries.length - 1
//           ];
//         const { dropoffLocation, dropoffDateTime } = lastEntry;

//         const conveyancedetails = req.body.localConveyanceEntries.map(
//           (item) => ({
//             pickupdateandtime: item.pickupDateTime,
//             pickuplocation: item.pickupLocation,
//             dropoffdateandtime: item.dropoffDateTime,
//             dropofflocation: item.dropoffLocation,
//             drivername: " ",
//             vehicleno: " ",
//             vehicletype: " ",
//             drivercontact: " ",
//             bookedby: " ",
//             bookedfor: " ",
//             remarks: " ",
//             status: "Pre-Planned",
//           })
//         );

//         if (req.body.localConveyanceEntries.length > 1) {
//           var conveyanceData = {
//             pnr: req.params.id,
//             initialpickupdateandtime: pickupDateTime,
//             initiallocation: pickupLocation,
//             finaldropoffdateandtime: dropoffDateTime,
//             finaldropofflocation: dropoffLocation,
//             conveyancedetails: conveyancedetails,
//             submittedby: req.body.submittedby,
//             draft: req.body.draft,
//           };
//         } else {
//           var conveyanceData = {
//             pnr: req.params.id,
//             initialpickupdateandtime: pickupDateTime,
//             initiallocation: pickupLocation,
//             finaldropoffdateandtime:
//               req.body.localConveyanceEntries[0].dropoffDateTime,
//             finaldropofflocation:
//               req.body.localConveyanceEntries[0].dropoffLocation,
//             conveyancedetails: [
//               {
//                 pickupdateandtime: pickupDateTime,
//                 pickuplocation: pickupLocation,
//                 dropoffdateandtime:
//                   req.body.localConveyanceEntries[0].dropoffDateTime,
//                 dropofflocation:
//                   req.body.localConveyanceEntries[0].dropoffLocation,
//                 drivername: " ",
//                 vehicleno: " ",
//                 vehicletype: " ",
//                 drivercontact: " ",
//                 bookedby: " ",
//                 bookedfor: " ",
//                 remarks: " ",
//                 status: "Pre-Planned",
//               },
//             ],
//             submittedby: req.body.submittedby,
//             draft: req.body.draft,
//           };
//         }

//         const conveyance = new Conveyance(conveyanceData);
//         await conveyance.save();
//         console.log("🚀 Conveyance Created Successfully");
//       } else {
//         // Extract pickupdateandtime and pickuplocation from the first object
//         const { pickupDateTime, pickupLocation } =
//           req.body.localConveyanceEntries[0];

//         // Extract dropofflocation and dropoffDateTime from the last object
//         const lastEntry =
//           req.body.localConveyanceEntries[
//             req.body.localConveyanceEntries.length - 1
//           ];
//         const { dropoffLocation, dropoffDateTime } = lastEntry;

//         const conveyancedetails = req.body.localConveyanceEntries.map(
//           (item) => ({
//             pickupdateandtime: item.pickupDateTime,
//             pickuplocation: item.pickupLocation,
//             dropoffdateandtime: item.dropoffDateTime,
//             dropofflocation: item.dropoffLocation,
//             drivername: " ",
//             vehicleno: " ",
//             vehicletype: " ",
//             drivercontact: " ",
//             bookedby: " getCombinedIndDetailsByPNR",
//             bookedfor: " ",
//             remarks: " ",
//             status: "Pre-Planned",
//           })
//         );

//         if (req.body.localConveyanceEntries.length > 1) {
//           let conveyance = await Conveyance.findOneAndUpdate(
//             { pnr: req.params.id },
//             {
//               $set: {
//                 initialpickupdateandtime: pickupDateTime,
//                 initiallocation: pickupLocation,
//                 finaldropoffdateandtime: dropoffDateTime,
//                 finaldropofflocation: dropoffLocation,
//                 conveyancedetails: conveyancedetails,
//                 submittedby: req.body.submittedby,
//                 draft: req.body.draft,
//               },
//             },
//             { new: true }
//           );
//           console.log("🚀 Conveyance Updated Successfully", conveyance);
//         } else {
//           let conveyance = await Conveyance.findOneAndUpdate(
//             { pnr: req.params.id },
//             {
//               $set: {
//                 initialpickupdateandtime: pickupDateTime,
//                 initiallocation: pickupLocation,
//                 finaldropoffdateandtime:
//                   req.body.localConveyanceEntries[0].dropoffDateTime,
//                 finaldropofflocation:
//                   req.body.localConveyanceEntries[0].dropoffLocation,
//                 conveyancedetails: [
//                   {
//                     pickupdateandtime: pickupDateTime,
//                     pickuplocation: pickupLocation,
//                     dropoffdateandtime:
//                       req.body.localConveyanceEntries[0].dropoffDateTime,
//                     dropofflocation:
//                       req.body.localConveyanceEntries[0].dropoffLocation,
//                     drivername: " ",
//                     vehicleno: " ",
//                     vehicletype: " ",
//                     drivercontact: " ",
//                     bookedby: " ",
//                     bookedfor: " ",
//                     remarks: " ",
//                     status: "Pre-Planned",
//                   },
//                 ],
//                 submittedby: req.body.submittedby,
//                 draft: req.body.draft,
//               },
//             },
//             { new: true }
//           );
//           console.log("🚀 Conveyance Updated Successfully", conveyance);
//         }
//       }
//     }

//     //Mail Logic
//     const ScheduleMailObject = {
//       pnr: req.params.id,
//       email: req.body.email,
//       hostname: req.body.employee,
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       date: req.body.arrivalDateTime,
//       date1: req.body.departureDateTime,
//       hostname: req.body.employee,
//       hostemail: req.body.officeemail,
//       purpose: req.body.purpose,
//     };

//     if (req.body.draft == false) {
//       let mailrespopnse = await IndVisitPendingApprovalMail(ScheduleMailObject);
//       console.log("Schedule Mail Response", mailrespopnse);
//     }

//     //Mail Logic
//     const ScheduleMailObject2 = {
//       pnr: req.params.id,
//       email: req.body.email,
//       visitortype: req.body.visitortype,
//       hostname: req.body.employee,
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       date: req.body.arrivalDateTime,
//       hostname: req.body.employee,
//       hostemail: req.body.officeemail,
//       purpose: req.body.purpose,
//       contact: req.body.contact,
//       gender: req.body.gender,
//       age: req.body.age,
//       pincode: req.body.pincode,
//       state: req.body.state,
//       district: req.body.district,
//       address: req.body.address,
//       organization: req.body.organization,
//       idtype: req.body.govtIdType,
//       idno: req.body.govtIdNumber,
//     };

//     if (req.body.draft == false) {
//       let mailrespopnse = await IndVisitApprovalMail(ScheduleMailObject2);
//       console.log("Schedule Mail Response", mailrespopnse);
//     }

//     if (!visit) {
//       return res.status(404).json(new ApiError(["Visit not found"]));
//     }
//     res.json(new ApiResponse(visit, "Visit updated successfully!"));
//   } catch (error) {
//     logger.error(error);
//     console.error(error);
//     res.status(500).json(new ApiError([error.message]));
//   }
// }


async function updateVisit(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(new ApiError(errors.array().map((error) => error.msg)));
    }
    await referenceEmailSchema.validate(req.body.officeemail);

    console.log("req.body:.............. ", req.body);
 // ✅ Convert input (assumed local) to UTC
 const toUTC = (str) => {
  const date = new Date(str);
  const offset = date.getTimezoneOffset() * 60000; // in ms
  return new Date(date.getTime() - offset);
};
    // Generate JWT token
    function generateTokenforVerify(payload) {
      // Parse visitEnd to obtain a Date object
      const visitEndTime = toUTC(req.body.departureDateTime);

      const expiresIn = Math.floor(
        (visitEndTime.getTime() - Date.now()) / 1000
      );
      
      // Calculate expiry duration in milliseconds
      // const expiresIn = visitEndTime.getTime() - Date.now();
      return jwt.sign(payload, `${process.env.VERIFYQRSECRET}`, {
        algorithm: "HS256",
        expiresIn,
      });
    }

    const tokenpayload = {
      pnr: req.params.id,
      visitstart: req.body.arrivalDateTime,
      visitend: req.body.departureDateTime,
      isAccomodationRequired: req.body.isStaying,
      isTravelRequired: req.body.isTraveling,
      visitorfirstname: req.body.firstName,
      visitorlastname: req.body.lastName,
      visitorgender: req.body.gender,
      // visitorage: req.body.age,
      visitorcontactno: req.body.contact,
      visitoremail: req.body.email,
      visitortype: req.body.visitortype,
      visitorpincode: req.body.pincode,
      visitorstate: req.body.state,
      visitordistrict: req.body.district,
      visitoraddress: req.body.address,
      visitororganization: req.body.organization,
      visitoridtype: req.body.govtIdType,
      visitortidno: req.body.govtIdNumber,
      hostname: req.body.employee,
      hostemail: req.body.officeemail,
      hostcontact: req.body.phoneNumber,
      hostdepartment: req.body.deptName,
      purpose: req.body.purpose,
      submittedby: req.body.submittedby,
    };

    let verifyqrtoken = generateTokenforVerify(tokenpayload);
    let verifyqrlink = `${process.env.VERIFYURL}/${req.params.id}/${verifyqrtoken}`;
    const Visitdetails = {
      ...tokenpayload,
      verifyqrlink: verifyqrlink,
      draft: req.body.draft,
    };

    // Visit Update
    const visit = await VisitIndividual.findOneAndUpdate(
      { pnr: req.params.id },
      {
        $set: {
          ...Visitdetails,
        },
      },
      { new: true }
    );

    // Accomodation Update
    if (req.body.isStaying == false) {
      const accomodation = await Accommodation.findOneAndDelete({
        pnr: req.params.id,
      });
      if (!accomodation) {
        console.log("Visit Accomodation not found");
      }
      console.log("Visit Accomodation deleted successfully!");
    } else {
      const accomodationfind = await Accommodation.find({ pnr: req.params.id });

      if (accomodationfind.length == 0) {
        let accommodationData = {
          pnr: req.params.id,
          arrivaldateandtime: req.body.accFromDate,
          departuredateandtime: req.body.accToDate,
          submittedby: req.body.submittedby,
          draft: req.body.draft,
        };

        const accommodation = new Accommodation(accommodationData);
        await accommodation.save();
        console.log("🚀 Accomodation Created Successfully");
      } else {
        const accommodation = await Accommodation.findOneAndUpdate(
          { pnr: req.params.id },
          {
            $set: {
              arrivaldateandtime: req.body.accFromDate,
              departuredateandtime: req.body.accToDate,
              submittedby: req.body.submittedby,
              draft: req.body.draft,
            },
          },
          { new: true }
        );

        console.log("🚀 Accomodation Updated Successfully", accommodation);
      }
    }

    // Conveyance Update
    if (req.body.isTraveling == false) {
      const conveyance = await Conveyance.findOneAndDelete({
        pnr: req.params.id,
      });
      if (!conveyance) {
        console.log("Visit Conveyance not found");
      }
      console.log("Visit Conveyance deleted successfully!");
    } else {
      const conveyancefind = await Conveyance.find({ pnr: req.params.id });

      if (conveyancefind.length == 0) {
        // Extract pickupdateandtime and pickuplocation from the first object
        const { pickupDateTime, pickupLocation } =
          req.body.localConveyanceEntries[0];

        // Extract dropofflocation and dropoffDateTime from the last object
        const lastEntry =
          req.body.localConveyanceEntries[
            req.body.localConveyanceEntries.length - 1
          ];
        const { dropoffLocation, dropoffDateTime } = lastEntry;

        const conveyancedetails = req.body.localConveyanceEntries.map(
          (item) => ({
            pickupdateandtime: item.pickupDateTime,
            pickuplocation: item.pickupLocation,
            dropoffdateandtime: item.dropoffDateTime,
            dropofflocation: item.dropoffLocation,
            drivername: " ",
            vehicleno: " ",
            vehicletype: " ",
            drivercontact: " ",
            bookedby: " ",
            bookedfor: " ",
            remarks: " ",
            status: "Pre-Planned",
          })
        );

        if (req.body.localConveyanceEntries.length > 1) {
          var conveyanceData = {
            pnr: req.params.id,
            initialpickupdateandtime: pickupDateTime,
            initiallocation: pickupLocation,
            finaldropoffdateandtime: dropoffDateTime,
            finaldropofflocation: dropoffLocation,
            conveyancedetails: conveyancedetails,
            submittedby: req.body.submittedby,
            draft: req.body.draft,
          };
        } else {
          var conveyanceData = {
            pnr: req.params.id,
            initialpickupdateandtime: pickupDateTime,
            initiallocation: pickupLocation,
            finaldropoffdateandtime:
              req.body.localConveyanceEntries[0].dropoffDateTime,
            finaldropofflocation:
              req.body.localConveyanceEntries[0].dropoffLocation,
            conveyancedetails: [
              {
                pickupdateandtime: pickupDateTime,
                pickuplocation: pickupLocation,
                dropoffdateandtime:
                  req.body.localConveyanceEntries[0].dropoffDateTime,
                dropofflocation:
                  req.body.localConveyanceEntries[0].dropoffLocation,
                drivername: " ",
                vehicleno: " ",
                vehicletype: " ",
                drivercontact: " ",
                bookedby: " ",
                bookedfor: " ",
                remarks: " ",
                status: "Pre-Planned",
              },
            ],
            submittedby: req.body.submittedby,
            draft: req.body.draft,
          };
        }

        const conveyance = new Conveyance(conveyanceData);
        await conveyance.save();
        console.log("🚀 Conveyance Created Successfully");
      } else {
        // Extract pickupdateandtime and pickuplocation from the first object
        const { pickupDateTime, pickupLocation } =
          req.body.localConveyanceEntries[0];

        // Extract dropofflocation and dropoffDateTime from the last object
        const lastEntry =
          req.body.localConveyanceEntries[
            req.body.localConveyanceEntries.length - 1
          ];
        const { dropoffLocation, dropoffDateTime } = lastEntry;
        req.body.localConveyanceEntries = JSON.parse(
          req.body.localConveyanceEntries || "[]"
        );

        const conveyancedetails = req.body.localConveyanceEntries.map(
          (item) => ({
            pickupdateandtime: item.pickupDateTime,
            pickuplocation: item.pickupLocation,
            dropoffdateandtime: item.dropoffDateTime,
            dropofflocation: item.dropoffLocation,
            drivername: " ",
            vehicleno: " ",
            vehicletype: " ",
            drivercontact: " ",
            bookedby: " getCombinedIndDetailsByPNR",
            bookedfor: " ",
            remarks: " ",
            status: "Pre-Planned",
          })
        );

        if (req.body.localConveyanceEntries.length > 1) {
          let conveyance = await Conveyance.findOneAndUpdate(
            { pnr: req.params.id },
            {
              $set: {
                initialpickupdateandtime: pickupDateTime,
                initiallocation: pickupLocation,
                finaldropoffdateandtime: dropoffDateTime,
                finaldropofflocation: dropoffLocation,
                conveyancedetails: conveyancedetails,
                submittedby: req.body.submittedby,
                draft: req.body.draft,
              },
            },
            { new: true }
          );
          console.log("🚀 Conveyance Updated Successfully", conveyance);
        } else {
          let conveyance = await Conveyance.findOneAndUpdate(
            { pnr: req.params.id },
            {
              $set: {
                initialpickupdateandtime: pickupDateTime,
                initiallocation: pickupLocation,
                finaldropoffdateandtime:
                  req.body.localConveyanceEntries[0].dropoffDateTime,
                finaldropofflocation:
                  req.body.localConveyanceEntries[0].dropoffLocation,
                conveyancedetails: [
                  {
                    pickupdateandtime: pickupDateTime,
                    pickuplocation: pickupLocation,
                    dropoffdateandtime:
                      req.body.localConveyanceEntries[0].dropoffDateTime,
                    dropofflocation:
                      req.body.localConveyanceEntries[0].dropoffLocation,
                    drivername: " ",
                    vehicleno: " ",
                    vehicletype: " ",
                    drivercontact: " ",
                    bookedby: " ",
                    bookedfor: " ",
                    remarks: " ",
                    status: "Pre-Planned",
                  },
                ],
                submittedby: req.body.submittedby,
                draft: req.body.draft,
              },
            },
            { new: true }
          );
          console.log("🚀 Conveyance Updated Successfully", conveyance);
        }
      }
    }

    // //Mail Logic
    // const ScheduleMailObject = {
    //   pnr: req.params.id,
    //   email: req.body.email,
    //   hostname: req.body.employee,
    //   firstName: req.body.firstName,
    //   lastName: req.body.lastName,
    //   date: req.body.arrivalDateTime,
    //   date1: req.body.departureDateTime,
    //   hostname: req.body.employee,
    //   hostemail: req.body.officeemail,
    //   purpose: req.body.purpose,
    // };

    // if (req.body.draft == false) {
    //   let mailrespopnse = await IndVisitPendingApprovalMail(ScheduleMailObject);
    //   console.log("Schedule Mail Response", mailrespopnse);
    // }

    // //Mail Logic
    // const ScheduleMailObject2 = {
    //   pnr: req.params.id,
    //   email: req.body.email,
    //   visitortype: req.body.visitortype,
    //   hostname: req.body.employee,
    //   firstName: req.body.firstName,
    //   lastName: req.body.lastName,
    //   date: req.body.arrivalDateTime,
    //   hostname: req.body.employee,
    //   hostemail: req.body.officeemail,
    //   purpose: req.body.purpose,
    //   contact: req.body.contact,
    //   gender: req.body.gender,
    //   age: req.body.age,
    //   pincode: req.body.pincode,
    //   state: req.body.state,
    //   district: req.body.district,
    //   address: req.body.address,
    //   organization: req.body.organization,
    //   idtype: req.body.govtIdType,
    //   idno: req.body.govtIdNumber,
    // };

    // if (req.body.draft == false) {
    //   let mailrespopnse = await IndVisitApprovalMail(ScheduleMailObject2);
    //   console.log("Schedule Mail Response", mailrespopnse);
    // }

    if (!visit) {
      return res.status(404).json(new ApiError(["Visit not found"]));
    }
    res.json(new ApiResponse(visit, "Visit updated successfully!"));
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).json(new ApiError([error.message]));
  }
}


// Delete a visit by ID
async function deleteVisit(req, res) {
  try {
    const visit = await VisitIndividual.findByIdAndDelete({
      pnr: req.params.id,
    });
    if (!visit) {
      return res.status(404).json(new ApiError(["Visit not found"]));
    }
    res.json(new ApiResponse(null, "Visit deleted successfully!"));
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).json(new ApiError([error.message]));
  }
}

module.exports = {
  createVisit,
  getAllVisits,
  getAllPastVisits,
  getVisitById,
  getVisitByEmail,
  updateVisit,
  deleteVisit,
  getAllPlannerPastVisits,
  getAllPlannerVisits,
};
