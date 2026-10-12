const { body } = require("express-validator");

exports.conveyanceValidate = [
  // Validate fields based on ConveyanceSchema
  body("conveyancedetails").isArray().withMessage("Conveyance details should be an array"),
  body("conveyancedetails.*.pickupdateandtime").notEmpty().withMessage("Pickup date and time is required."),
  body("conveyancedetails.*.pickuplocation").notEmpty().withMessage("Pickup location is required."),
  body("conveyancedetails.*.dropoffdateandtime").notEmpty().withMessage("DropOff date and time is required."),
  body("conveyancedetails.*.dropofflocation").notEmpty().withMessage("DropOff location is required."),
  body("conveyancedetails.*.drivername").notEmpty().withMessage("Driver name is required."),
  body("conveyancedetails.*.vehicleno").notEmpty().withMessage("Vehicle number is required."),
  body("conveyancedetails.*.vehicletype").notEmpty().withMessage("Vehicle type is required."),
  body("conveyancedetails.*.drivercontact").notEmpty().withMessage("Driver contact is required."),
  body("conveyancedetails.*.bookedby").notEmpty().withMessage("Booked by is required."),
  body("conveyancedetails.*.bookedfor").notEmpty().withMessage("Booked for is required."),
  body("conveyancedetails.*.remarks").notEmpty().withMessage("Remarks are required."),
  body("conveyancedetails.*.status").notEmpty().withMessage("Status is required.")
      .isIn(["Pre-Planned","Planned","Completed","Cancelled"]).withMessage("Invalid status value.")
];
