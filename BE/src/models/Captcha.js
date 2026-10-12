// models/Captcha.js
// const mongoose = require("mongoose");

// const captchaSchema = new mongoose.Schema({
//   captchaId: { type: String, required: true, unique: true },
//   answer: { type: Number, required: true },
//   createdAt: { type: Date, default: Date.now, expires: 120 } 
//   // auto-delete after 120s (TTL index)
// });

// module.exports = mongoose.model("Captcha", captchaSchema);


const mongoose = require("mongoose");

const captchaSchema = new mongoose.Schema({
  captchaId: { type: String, required: true, unique: true },
  answer: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  ip: { type: String }, // store requester IP
  createdAt: { type: Date, default: Date.now, expires: 120 } // auto-delete after 120s
});
module.exports = mongoose.model("Captcha", captchaSchema);