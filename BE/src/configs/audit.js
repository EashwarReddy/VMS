// utils/audit.js
const { auditLogger } = require("./logger");

function logAuditEvent({
  event,
  user,
  userId,
  userRole,
  ip,
  url,
  status,
  userAgent,
  pnr = null,
  meta = {},
  reason
}) {
  auditLogger.info({
    event,
    user,
    userId,
  userRole,
  ip,
  url,
    pnr,
    status,
    userAgent,
    meta,
    reason
  });
}

module.exports = { logAuditEvent };
