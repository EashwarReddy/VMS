const express = require("express");
const router = express.Router();
const { logger } = require("../configs/logger");

router.post("/frontend", async (req, res) => {
  try {
    const { level, message, ...details } = req.body;
  const logMessage = `FRONTEND_LOG: ${message} ${JSON.stringify(details)}`;
  logger[level] ? logger[level](logMessage) : logger.info(logMessage);
  res.status(200).json({ success: true });
  } catch (err) {
    logger.error(`Error saving frontend log: ${err.message}`);
    res.status(500).json({ success: false, message: "Failed to save frontend log" });
  }
});

module.exports = router;
