const { default: mongoose } = require("mongoose");
const { visitorMovementStatusEnums } = require("../enums");
const { cleanString } = require("../utils/sanitizer");

const VisitorMovementSchema = mongoose.Schema(
  {
    pnr: {
      type: String,
      unique: true,
    },
    movements: [
      {
        visitInTime: {
          type: String,
        },
        visitOutTime: {
          type: String,
          default: null,
        },
        photo: {
          type: String,
          required: [true, "Photo on movement is required."],
        },
        assets: [
          { type: { type: String,trim: true, set: cleanString }, serialNo: { type: String,trim: true, set: cleanString }, _id: false },
        ],
        vehicleNo: { type: String,trim: true , set: cleanString},
      },
    ],
    status: {
      type: String,
      enum: visitorMovementStatusEnums,
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Create indexes

VisitorMovementSchema.index({ pnr: 1 }); // Unique index for pnr
// FeedbackSchema.index({ visitstatus: 1 }); // Index for visitstatus
// FeedbackSchema.index({ visitstart: 1, visitend: 1 }); // Compound index for visitstart and visitend
// FeedbackSchema.index({ visitoraddress: 'text', visitororganization: 'text' }); // Text index for visitoraddress and visitororganization

module.exports = mongoose.model("VisitorMovement", VisitorMovementSchema);
