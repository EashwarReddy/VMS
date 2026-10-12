// middlewares/rateLimiters.js
const rateLimit = require("express-rate-limit");

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 attempts
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip, // optional: limit per email
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      errors: ["Too many password reset requests. Try again later."],
      data: null,
    });
  },
});

module.exports = { forgotPasswordLimiter };
