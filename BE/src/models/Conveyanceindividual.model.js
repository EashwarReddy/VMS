const { default: mongoose } = require("mongoose");
const { conveyanceStatusEnums } = require("../enums");
const validator = require("validator");

const { cleanString } = require("../utils/sanitizer");

const ConveyanceDetailsSchema = new mongoose.Schema(
  {
    pickupdateandtime: {
      type: Date,
      required: [true, "Pickup date and time is required."],
    },
    pickuplocation: {
      type: String,
      required: [true, "Pickup location is required."],
      trim: true,
      maxlength: 50,
      set: cleanString 
    },
    dropoffdateandtime: {
      type: Date,
      required: [true, "Drop-off date and time is required."],
      validate: {
        validator: function (value) {
          return value > this.pickupdateandtime;
        },
        message: "Drop-off date must be after pickup date.",
      },
    },
    dropofflocation: {
      type: String,
      required: [true, "Drop-off location is required."],
      trim: true,
      maxlength: 50,
      set: cleanString 
    },
    drivername: { type: String, trim: true, maxlength: 50, set: cleanString, default: "N/A" },
vehicleno: { type: String, trim: true, maxlength: 50, set: cleanString, default: "N/A" },
vehicletype: { type: String, trim: true, maxlength: 50, set: cleanString, default: "N/A" },
drivercontact: { type: String, trim: true, match: [/^\d{10}$/], default: "0000000000" },
bookedby: { type: String, trim: true, maxlength: 50, set: cleanString },
bookedfor: { type: String, trim: true, maxlength: 50, set: cleanString },
    remarks: {
      type: String,
      trim: true,
      maxlength: 250,
      set: cleanString 
    },
    status: {
      type: String,
      required: [true, "Status is required."],
      enum: conveyanceStatusEnums,
      default: "Planned",
    },
  },
  {
    timestamps: true,
  }
);

const ConveyanceIndividualSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      required: [true, "PNR is required."],
      trim: true,
      unique: true,
    },
    initialpickupdateandtime: {
      type: Date,
      required: [true, "Initial pickup date and time is required."],
    },
    initiallocation: {
      type: String,
      required: [true, "Initial location is required."],
      trim: true,
    },
    finaldropoffdateandtime: {
      type: Date,
      required: [true, "Final drop-off date and time is required."],
      validate: {
        validator: function (value) {
          return value > this.initialpickupdateandtime;
        },
        message: "Final drop-off date must be after initial pickup date.",
      },
    },
    finaldropofflocation: {
      type: String,
      required: [true, "Final drop-off location is required."],
      trim: true,
    },
    approvedByHost: {
      type: Boolean,
      default: false,
    },
    conveyancedetails: [ConveyanceDetailsSchema], // Embedded Schema
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



// Indexes for ConveyanceDetails
ConveyanceDetailsSchema.index({ pickupdateandtime: 1 });
ConveyanceDetailsSchema.index({ dropoffdateandtime: 1 });
ConveyanceDetailsSchema.index({ bookedby: 1 });
ConveyanceDetailsSchema.index({ pickuplocation: 1 });
ConveyanceDetailsSchema.index({ dropofflocation: 1 });
ConveyanceDetailsSchema.index({ status: 1 });

// Indexes for ConveyanceIndividual
ConveyanceIndividualSchema.index({ initialpickupdateandtime: 1 });
ConveyanceIndividualSchema.index({ finaldropoffdateandtime: 1 });
ConveyanceIndividualSchema.index({ pnr: 1 }, { unique: true });


module.exports = mongoose.model(
  "ConveyanceIndividual",
  ConveyanceIndividualSchema
);

