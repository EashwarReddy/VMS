const nodemailer = require("nodemailer");

// Supply credentials through local environment configuration, never source code.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVICE_ID,
    pass: process.env.EMAIL_SERVICE_PASSWORD,
  },
});

module.exports = { transporter };
