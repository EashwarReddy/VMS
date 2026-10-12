// models/Blacklist.model.js
const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } } // auto-remove after expiry
});

module.exports = mongoose.model("Blacklist", blacklistSchema);
