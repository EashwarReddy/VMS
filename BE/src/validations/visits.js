const { body } = require("express-validator");

// exports.validateVisitIndividual = [
//   // Validate fields based on VisitIndividualSchema
//   body("arrivalDateTime")
//     .notEmpty()
//     .withMessage("Visit start date and time is required."),
//   body("departureDateTime")
//     .notEmpty()
//     .withMessage("Visit end date and time is required."),
//   body("isStaying")
//     .notEmpty()
//     .withMessage("Is accommodation required is required."),
//   body("isTraveling").notEmpty().withMessage("Is travel required."),
//   body("firstName").notEmpty().withMessage("Visitor's first name is required."),
//   body("lastName").notEmpty().withMessage("Visitor's last name is required."),
//   body("gender").notEmpty().withMessage("Visitor's gender is required."),
//   // body("age").notEmpty().withMessage("Visitor's age is required."),
//   body("contact")
//     .notEmpty()
//     .withMessage("Visitor's contact number is required."),
//   body("email").notEmpty().withMessage("Visitor's email is required."),
//   body("visitorType").notEmpty().withMessage("Visitor type is required."),
//   body("pincode").notEmpty().withMessage("Visitor's pincode is required."),
//   body("state").notEmpty().withMessage("Visitor's state is required."),
//   body("district").notEmpty().withMessage("Visitor's district is required."),
//   body("address").notEmpty().withMessage("Visitor's address is required."),
//   body("organization")
//     .notEmpty()
//     .withMessage("Visitor's organization is required."),
//   body("govtIdType")
//     .notEmpty()
//     .withMessage("Visitor's id type is required.")
//     .isIn([
//       "AADHAR",
//       "PAN",
//       "VOTERID",
//       "DRIVING_LICENSE",
//       "ORGANIZATION_ID",
//       "PASSPORT",
//     ])
//     .withMessage("Invalid id type."),
//   body("govtIdNumber").notEmpty().withMessage("Visitor's id no is required"),
//   // .isLength({ max: 4 })
//   // .withMessage("Visitor's id no must be at most 4 characters long"),
//   body("employee").notEmpty().withMessage("Host's name is required."),
//   body("officeemail").notEmpty().withMessage("Host's email is required."),
//   body("phoneNumber").notEmpty().withMessage("Host's contact is required."),
//   body("purpose").notEmpty().withMessage("Purpose of the visit is required."),
//   body("submittedby")
//     .notEmpty()
//     .withMessage("SubmittedBy of the visit is required."),
//   body("draft").notEmpty().withMessage("DraftStatus of the visit is required."),

//   // body("visitstatus")
//   //   .notEmpty()
//   //   .withMessage("Visit status is required.")
//   //   .isIn(["Planned", "Ongoing", "Completed", "Cancelled"])
//   //   .withMessage("Invalid visit status value."),
// ];

exports.validateVisitIndividual = [
  // Dates
  body("arrivalDateTime")
    .notEmpty()
    .withMessage("Visit start date and time is required."),

  body("departureDateTime")
    .notEmpty()
    .withMessage("Invalid departure date format")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.arrivalDateTime)) {
        throw new Error("Departure must be after arrival");
      }
      return true;
    }),

    body("isStaying")
    .toBoolean()
    .isBoolean()
    .withMessage("isStaying must be true or false"),
  
  body("isTraveling")
    .toBoolean()
    .isBoolean()
    .withMessage("isTraveling must be true or false"),
  
  body("draft")
    .toBoolean()
    .isBoolean()
    .withMessage("draft must be true or false"),

  // Visitor info
  body("firstName").trim().notEmpty().withMessage("Visitor's first name is required."),
  body("lastName").trim().notEmpty().withMessage("Visitor's last name is required."),
  body("gender").trim().notEmpty().withMessage("Visitor's gender is required."),
  body("contact").trim().notEmpty().withMessage("Visitor's contact number is required."),

  body("email")
    .notEmpty()
    .withMessage("Visitor's email is required.")
    .isEmail()
    .withMessage("Invalid visitor email"),

  body("visitorType").notEmpty().withMessage("Visitor type is required."),

  body("pincode").notEmpty().withMessage("Visitor's pincode is required."),
  body("state").notEmpty().withMessage("Visitor's state is required."),
  body("district").notEmpty().withMessage("Visitor's district is required."),
  body("address").notEmpty().withMessage("Visitor's address is required."),
  body("organization").notEmpty().withMessage("Visitor's organization is required."),

  // ID
  body("govtIdType")
    .isIn([
      "AADHAR",
      "PAN",
      "VOTERID",
      "DRIVING_LICENSE",
      "ORGANIZATION_ID",
      "PASSPORT",
    ])
    .withMessage("Invalid id type"),

  body("govtIdNumber")
    .notEmpty()
    .withMessage("Visitor's id number is required"),

  // Host
  body("employee").notEmpty().withMessage("Host's name is required."),
  body("officeemail")
    .notEmpty()
    .withMessage("Host's email is required.")
    .isEmail()
    .withMessage("Invalid host email"),

  body("phoneNumber").notEmpty().withMessage("Host's contact is required."),
  body("purpose").notEmpty().withMessage("Purpose of the visit is required."),
  body("submittedby").notEmpty().withMessage("SubmittedBy is required."),

  // ✅ Conditional: accommodation
  body("accFromDate")
    .if(body("isStaying").equals("true"))
    .notEmpty()
    .withMessage("Accommodation from date is required"),

  body("accToDate")
    .if(body("isStaying").equals("true"))
    .notEmpty()
    .withMessage("Accommodation to date is required"),

  // ✅ Conditional: travel
  body("localConveyanceEntries")
    .if(body("isTraveling").equals("true"))
    .custom((value) => {
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch {
        throw new Error("localConveyanceEntries must be valid JSON");
      }
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("At least one conveyance entry is required");
      }
      return true;
    }),
];






exports.validateVisitOrganization = [
  // Validate fields based on visitorganizationSchema
  body("arrivalDateTime")
    .notEmpty()
    .withMessage("Visit start date and time is required."),
  body("departureDateTime")
    .notEmpty()
    .withMessage("Visit end date and time is required."),
  body("isStaying")
    .notEmpty()
    .withMessage("Is accommodation required is required."),
  body("isTraveling").notEmpty().withMessage("Is travel required is required."),
  body("firstName").notEmpty().withMessage("Visitor's first name is required."),
  body("lastName").notEmpty().withMessage("Visitor's last name is required."),
  body("gender").notEmpty().withMessage("Visitor's gender is required."),
  // body("age").notEmpty().withMessage("Visitor's age is required."),
  body("contact")
    .notEmpty()
    .withMessage("Visitor's contact number is required."),
  body("email").notEmpty().withMessage("Visitor's email is required."),
  body("visitorType").notEmpty().withMessage("Visitor type is required."),
  body("pincode").notEmpty().withMessage("Visitor's pincode is required."),
  body("state").notEmpty().withMessage("Visitor's state is required."),
  body("district").notEmpty().withMessage("Visitor's district is required."),
  body("address").notEmpty().withMessage("Visitor's address is required."),
  body("organization")
    .notEmpty()
    .withMessage("Visitor's organization is required."),
  body("govtIdType")
    .notEmpty()
    .withMessage("Visitor's id type is required.")
    .isIn(["AADHAR", "PAN", "VOTERID", "DRIVING_LICENSE", "ORGANIZATION_ID"])
    .withMessage("Invalid id type."),
  body("govtIdNumber").notEmpty().withMessage("Visitor's id no is required"),
  // .isLength({ max: 4 })
  // .withMessage("Visitor's id no must be at most 4 characters long"),
  body("employee").notEmpty().withMessage("Host's name is required."),
  body("officeemail").notEmpty().withMessage("Host's email is required."),
  body("phoneNumber").notEmpty().withMessage("Host's contact is required."),
  body("purpose").notEmpty().withMessage("Purpose of the visit is required."),
  body("draft").notEmpty().withMessage("DraftStatus of the visit is required."),
  body("submittedby")
    .notEmpty()
    .withMessage("SubmittedBy of the visit is required."),

  // body("visitstatus")
  //   .notEmpty()
  //   .withMessage("Visit status is required.")
  //   .isIn(["Planned", "Ongoing", "Completed", "Cancelled"])
  //   .withMessage("Invalid visit status value."),
  // Secondary visitor validation
  body("secondaryvisitors")
    .isArray()
    .withMessage("Secondary visitors must be an array")
    .notEmpty()
    .withMessage("At least one secondary visitor is required"),
  body("secondaryvisitors.*.firstName")
    .notEmpty()
    .withMessage("Secondary Visitor's first name is required."),
  body("secondaryvisitors.*.lastName")
    .notEmpty()
    .withMessage("Secondary Visitor's last name is required."),
  body("secondaryvisitors.*.gender")
    .notEmpty()
    .withMessage("Secondary Visitor's gender is required."),
  // body("secondaryvisitors.*.age")
  //   .notEmpty()
  //   .withMessage("Secondary Visitor's age is required."),
  body("secondaryvisitors.*.contact")
    .notEmpty()
    .withMessage("Secondary Visitor's contact number is required."),
  body("secondaryvisitors.*.email")
    .notEmpty()
    .withMessage("Secondary Visitor's email is required."),
  body("secondaryvisitors.*.pincode")
    .notEmpty()
    .withMessage("Secondary Visitor's pincode is required."),
  body("secondaryvisitors.*.state")
    .notEmpty()
    .withMessage("Secondary Visitor's state is required."),
  body("secondaryvisitors.*.district")
    .notEmpty()
    .withMessage("Secondary Visitor's district is required."),
  body("secondaryvisitors.*.address")
    .notEmpty()
    .withMessage("Secondary Visitor's address is required."),
  body("secondaryvisitors.*.organization")
    .notEmpty()
    .withMessage("Secondary Visitor's organization is required."),
  body("secondaryvisitors.*.govtIdType")
    .notEmpty()
    .withMessage("Secondary Visitor's id type is required.")
    .isIn(["AADHAR", "PAN", "VOTERID", "DRIVING_LICENSE", "ORGANIZATION_ID"])
    .withMessage("Invalid id type."),
  body("secondaryvisitors.*.govtIdNumber")
    .notEmpty()
    .withMessage("Secondary Visitor's id no is required"),
  // .isLength({ max: 4 })
  // .withMessage("Secondary Visitor's id no must be at most 4 characters long"),
];
