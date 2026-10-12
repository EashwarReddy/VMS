const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");

// Ensure logs directory exists
// const logDir = path.join(__dirname, "../../../../secure-logs");
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir, { mode: 0o750 }); // secure permissions
// }

// Keep local development writable without requiring system-level privileges.
const logDir = process.env.LOG_DIR || path.join(__dirname, "../../logs");

// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir, { recursive: true, mode: 0o750 });
// }

if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true, mode: 0o750 });
  } catch (err) {
    console.error("❌ Failed to initialize log directory:", err.message);
    process.exit(1); // safer than running without logs
  }
}


const { combine, timestamp, errors, printf, json } = winston.format;

// Human-readable format for most logs
const logFormat = printf(({ timestamp, level, message, stack, ...meta }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ""
  }`;
});

// === Main App Logger (info, error, etc.) ===
const logger = winston.createLogger({
  level: "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, "access-%DATE%.log"), // 👈 NEW
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      level: "info",
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, "errors-%DATE%.log"),
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
    }),
    new winston.transports.Console({ format: logFormat }),
  ],
});


// === Security Logger ===
const securityLogger = winston.createLogger({
  level: "warn",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, "security-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "50m",
      maxFiles: "90d",
    }),
  ],
});

// === Audit Logger (structured JSON, 1 year retention) ===
const auditLogger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), json()), // JSON format for traceability
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, "audit-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "50m",
      maxFiles: "365d",
    }),
  ],
});

// Database operation logger
const dbLogger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()), // JSON format for traceability
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'database-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',
      maxFiles: '90d',
    })
  ]
});

module.exports = { logger, securityLogger, auditLogger,dbLogger };
