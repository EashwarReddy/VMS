const { default: mongoose } = require("mongoose");
const { accomodationStatusEnums } = require("../enums");

const validator = require("validator");

const { cleanString } = require("../utils/sanitizer");

const AccomodationDetailsSchema = new mongoose.Schema(
  {
    accomodationname: {
      type: String,
      required: [true, "Accomodation name is required."],
      trim: true,
      minlength: [3, "Accomodation name must be at least 3 characters."],
      maxlength: [100, "Accomodation name cannot exceed 100 characters."],
      set: cleanString
    },
    accomodationaddress: {
      type: String,
      required: [true, "Accomodation address is required."],
      trim: true,
      set: cleanString
    },
    checkindateandtime: {
      type: Date,
      required: [true, "Check-in date and time is required."],
    },
    checkoutdateandtime: {
      type: Date,
      required: [true, "Check-out date and time is required."],
      validate: {
        validator: function (value) {
          return value > this.checkindateandtime;
        },
        message: "Check-out date must be after check-in date.",
      },
    },
    accomodationcontact: {
      type: String,
      required: [true, "Accomodation contact is required."],
      trim: true,
      match: [/^\d{10}$/, "Contact must be a valid 10-digit number."],
    },
    bookedby: {
      type: String,
      required: [true, "Booked by is required."],
      trim: true,
      maxlength: 50,
      set: cleanString 
    },
    bookedfor: {
      type: String,
      required: [true, "Booked for is required."],
      trim: true,
      maxlength: 50,
      set: cleanString 
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 250,
      set: cleanString 
    },
    status: {
      type: String,
      required: [true, "Status is required."],
      enum: accomodationStatusEnums,
      default: "Planned",
    },
  },
  { timestamps: true }
);


const AccomodationIndividualSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      required: [true, "PNR is required."],
      trim: true,
      unique: true,
    },
    arrivaldateandtime: {
      type: Date,
      required: [true, "Arrival date and time is required."],
    },
    departuredateandtime: {
      type: Date,
      required: [true, "Departure date and time is required."],
      validate: {
        validator: function (value) {
          return value > this.arrivaldateandtime;
        },
        message: "Departure date must be after arrival date.",
      },
    },
    approvedByHost: {
      type: Boolean,
      default: false,
    },
    accomodationdetails: [AccomodationDetailsSchema], // Embedded Schema
    draft: {
      type: Boolean,
      required: [true, "Draft status is required."],
    },
    submittedby: {
      type: String,
      required: [true, "Submitted by is required."],
      trim: true,
    },
  },
  { timestamps: true }
);


// Indexes for AccomodationDetails
AccomodationDetailsSchema.index({ checkindateandtime: 1 });
AccomodationDetailsSchema.index({ checkoutdateandtime: 1 });
AccomodationDetailsSchema.index({ bookedby: 1 });
AccomodationDetailsSchema.index({ bookedfor: 1 });
AccomodationDetailsSchema.index({ status: 1 });

// Indexes for AccomodationIndividual
AccomodationIndividualSchema.index({ arrivaldateandtime: 1 });
AccomodationIndividualSchema.index({ departuredateandtime: 1 });
AccomodationIndividualSchema.index({ pnr: 1 });

module.exports = mongoose.model(
  "AccomodationIndividual",
  AccomodationIndividualSchema
);
