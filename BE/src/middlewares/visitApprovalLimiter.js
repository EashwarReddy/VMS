const rateLimit = require("express-rate-limit");
const { ApiError } = require("../utils/ApiError");
const { logAuditEvent } = require("../configs/audit");

const registerUserLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // ⏱ 15 minutes
  max: 2, // 🚦 max registrations per window
  standardHeaders: true,
  legacyHeaders: false,

  // 🔑 Key: email if present, else IP
  keyGenerator: (req) => {
    return req.body?.email || req.ip;
  },

  handler: (req, res) => {
    logAuditEvent({
      event: "_RATE_LIMIT_EXCEEDED",
      ip: req.ip.replace("::ffff:", ""),
      userAgent: req.get("User-Agent"),
      url: req.originalUrl,
      status: "BLOCKED",
      reason: "TOO_MANY_ATTEMPTS",
      userId: req.userContext.userId,
      userRole: req.userContext.roleName,
      meta: {
        windowMinutes: 10,
        maxRequests: 2,
        method: req.method
      }
    });

    return res.status(429).json(
      new ApiError([
        "Too many  attempts detected. Please try again later."
      ])
    );
  }
});

module.exports = registerUserLimiter;
