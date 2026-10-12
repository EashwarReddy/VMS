const { body } = require("express-validator");

exports.accomodationValidate = [
  // Validate fields based on AccommodationDetails schema
  body("pnr").notEmpty().withMessage("PNR is required."),
  body("accomodationdetails")
    .isArray()
    .withMessage("Accomodation details should be an array"),
  body("accomodationdetails.*.accomodationname")
    .notEmpty()
    .withMessage("Accommodation name is required."),
  body("accomodationdetails.*.accomodationaddress")
    .notEmpty()
    .withMessage("Accommodation address is required."),
  body("accomodationdetails.*.checkindateandtime")
    .notEmpty()
    .withMessage("Check-in date and time is required."),
  body("accomodationdetails.*.checkoutdateandtime")
    .notEmpty()
    .withMessage("Check-out date and time is required."),
  body("accomodationdetails.*.accomodationcontact")
    .notEmpty()
    .withMessage("Accommodation contact is required."),
  body("accomodationdetails.*.bookedby")
    .notEmpty()
    .withMessage("Booked by is required."),
  body("accomodationdetails.*.bookedfor")
    .notEmpty()
    .withMessage("Booked for is required."),
  body("accomodationdetails.*.remarks")
    .notEmpty()
    .withMessage("Remarks are required."),
  body("accomodationdetails.*.status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(["Planned", "Completed", "Cancelled"])
    .withMessage("Invalid status value."),
];
