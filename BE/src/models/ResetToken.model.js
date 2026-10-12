const mongoose = require("mongoose");

const resetTokenSchema = new mongoose.Schema({
  resetId: {
    type: String,
    unique: true,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jwtToken: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model("ResetToken", resetTokenSchema);
