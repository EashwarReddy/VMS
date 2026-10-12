const mongoose = require("mongoose");

const VisitTrackTokenSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      required: true,
      unique: true,          // Only one tracking token per PNR
      index: true,
    },

    token: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VisitTrackToken", VisitTrackTokenSchema);
