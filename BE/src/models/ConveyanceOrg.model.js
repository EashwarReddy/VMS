const { default: mongoose } = require("mongoose");
const { conveyanceStatusEnums } = require("../enums");

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
    },
    drivername: {
      type: String,
      required: [true, "Driver name is required."],
      trim: true,
    },
    vehicleno: {
      type: String,
      required: [true, "Vehicle number is required."],
      trim: true,
    },
    vehicletype: {
      type: String,
      required: [true, "Vehicle type is required."],
      trim: true,
    },
    drivercontact: {
      type: String,
      required: [true, "Driver contact is required."],
      trim: true,
      match: [/^\d{10}$/, "Driver contact must be a valid 10-digit number."],
    },
    bookedby: {
      type: String,
      required: [true, "Booked by is required."],
      trim: true,
    },
    bookedfor: {
      type: String,
      required: [true, "Booked for is required."],
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
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


const ConveyanceOrganizationSchema = mongoose.Schema(
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
ConveyanceOrganizationSchema.index({ initialpickupdateandtime: 1 });
ConveyanceOrganizationSchema.index({ finaldropoffdateandtime: 1 });
ConveyanceOrganizationSchema.index({ pnr: 1 }, { unique: true });

module.exports = mongoose.model(
  "ConveyanceOrganization",
  ConveyanceOrganizationSchema
);
