const rateLimit = require("express-rate-limit");
const { ApiError } = require("../utils/ApiError");
const { logAuditEvent } = require("../configs/audit");

const visitSubmissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.email || req.ip;
  },
  handler: (req, res) => {

    logAuditEvent({
      event: "VISIT_RATE_LIMIT_EXCEEDED",
      user: "[REDACTED_EMAIL]"  ,
      status: "BLOCKED",
      meta: {
        windowMinutes: 10,
        maxRequests: 2,
        path: req.url,
        method: req.method
      }
    });

    return res.status(429).json(
      new ApiError([
        "Too many visit submissions detected. Please try again later."
      ])
    );
  }
});

module.exports = visitSubmissionLimiter;
