const nodemailer = require("nodemailer");

function createMailer(
  env = process.env,
  transportFactory = nodemailer.createTransport
) {
  const enabled = env.WORKSPACE_EMAIL_ENABLED === "true";
  const port = Number(env.WORKSPACE_SMTP_PORT || 587);
  const configured =
    enabled &&
    Boolean(
      env.WORKSPACE_SMTP_HOST &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.WORKSPACE_SMTP_FROM || "") &&
        Number.isInteger(port) &&
        port > 0 &&
        port <= 65535 &&
        Boolean(env.WORKSPACE_SMTP_USER) ===
          Boolean(env.WORKSPACE_SMTP_PASSWORD)
    );
  let transport;
  return {
    enabled,
    isConfigured: () => configured,
    async send(notification) {
      if (!configured) throw new Error("Email is not configured.");
      transport ||= transportFactory({
        host: env.WORKSPACE_SMTP_HOST,
        port,
        secure: port === 465,
        requireTLS: port !== 465,
        auth: env.WORKSPACE_SMTP_USER
          ? { user: env.WORKSPACE_SMTP_USER, pass: env.WORKSPACE_SMTP_PASSWORD }
          : undefined,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      });
      const title =
        notification.kind === "overstay"
          ? "Visitor overstay alert"
          : notification.kind === "asset-discrepancy"
            ? "Visitor asset discrepancy"
            : "Visitor management update";
      const result = await transport.sendMail({
        from: env.WORKSPACE_SMTP_FROM,
        to: notification.recipient,
        subject: `${title} — ${notification.visit}`,
        text: `${notification.message}\n\nVisit reference: ${notification.visit}\nOpen your Visitor Management System to review the visit.`,
        messageId: `<vms-${notification._id}@notifications.vms.local>`,
      });
      if (!result.accepted?.length) throw new Error("Email was not accepted.");
    },
  };
}
module.exports = { createMailer };
