const express = require("express");
const mongoose = require("mongoose");
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const path = require("node:path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config({
  path: path.join(__dirname, "../../.workspace.env"),
});

const mailer = require("./notification-email").createMailer();
const scrypt = promisify(crypto.scrypt);
const ROLES = ["Admin", "Visitor", "Host", "Planner", "Security"];
const cookieName = "vms_session";
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const token = () => crypto.randomBytes(32).toString("hex");
const schema = (fields) =>
  new mongoose.Schema(fields, { timestamps: true, strict: true });
const Account = mongoose.model(
  "WorkspaceAccount",
  schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    salt: String,
    role: { type: String, enum: ROLES },
    active: { type: Boolean, default: true },
  })
);
const Session = mongoose.model(
  "WorkspaceSession",
  schema({
    tokenHash: { type: String, unique: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "WorkspaceAccount" },
    csrf: String,
    expires: { type: Date, expires: 0 },
  })
);
const Visit = mongoose.model(
  "WorkspaceVisit",
  schema({
    id: { type: String, unique: true },
    creator: String,
    name: String,
    email: String,
    organization: String,
    host: String,
    hostEmail: String,
    department: String,
    purpose: String,
    date: String,
    endDate: String,
    time: String,
    endTime: String,
    transport: Boolean,
    accommodation: Boolean,
    pickup: String,
    spot: Boolean,
    status: String,
    version: { type: Number, default: 1 },
    plan: { vehicle: String, pickup: String, stay: String },
    logs: [
      {
        in: String,
        out: String,
        assets: String,
        exitAssets: String,
        assetResult: String,
        assetNotes: String,
        exitVerifiedBy: String,
        exitVerifiedAt: String,
      },
    ],
    passHash: String,
    passToken: String,
  })
);
const Audit = mongoose.model(
  "WorkspaceAudit",
  schema({ actor: String, action: String, visit: String })
);
const Notification = mongoose.model(
  "WorkspaceNotification",
  schema({
    eventKey: { type: String, unique: true, sparse: true },
    kind: String,
    recipient: String,
    message: String,
    visit: String,
    read: { type: Boolean, default: false },
    emailState: {
      type: String,
      enum: ["disabled", "queued", "sending", "sent", "failed"],
      default: () => (mailer.isConfigured() ? "queued" : "disabled"),
    },
    emailAttempts: { type: Number, default: 0 },
    emailNextAttempt: Date,
    emailLeaseUntil: Date,
    emailSentAt: Date,
    emailError: String,
  })
);
const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const fail = (status, message) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};
const accountView = (account) => ({
  id: account.id,
  name: account.name,
  email: account.email,
  role: account.role,
  active: account.active,
});
const dateInIndia = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

async function createAccount(input, role) {
  if (
    !input.name?.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email || "") ||
    typeof input.password !== "string" ||
    input.password.length < 12 ||
    input.password.length > 128
  )
    fail(
      400,
      "Provide a name, valid email, and a password of 12–128 characters."
    );
  const salt = token();
  const password = (await scrypt(input.password, salt, 64)).toString("hex");
  return Account.create({
    name: input.name.trim().slice(0, 100),
    email: input.email.trim().toLowerCase(),
    role,
    password,
    salt,
  });
}
function scope(user) {
  if (user.role === "Admin") return {};
  if (user.role === "Host")
    return { $or: [{ hostEmail: user.email }, { creator: user.email }] };
  if (user.role === "Visitor") return { creator: user.email };
  if (user.role === "Planner")
    return {
      status: { $in: ["Approved", "Checked in", "Completed"] },
      $or: [{ transport: true }, { accommodation: true }],
    };
  return {
    $or: [
      { status: { $in: ["Approved", "Checked in", "Completed"] } },
      { creator: user.email },
    ],
  };
}
function visitView(doc) {
  const v = doc.toObject();
  delete v._id;
  delete v.__v;
  delete v.passHash;
  delete v.passToken;
  const deadline = Date.parse(`${v.endDate || v.date}T${v.endTime}:00+05:30`);
  v.overstay =
    v.status === "Checked in" &&
    Number.isFinite(deadline) &&
    Date.now() > deadline;
  v.overdueMinutes = v.overstay
    ? Math.ceil((Date.now() - deadline) / 60000)
    : 0;
  return v;
}
async function notifyPeople(visit, kind, message, eventKey) {
  const roles =
    kind === "overstay" || kind === "asset-discrepancy"
      ? ["Admin", "Security"]
      : kind === "approve" && (visit.transport || visit.accommodation)
        ? ["Admin", "Planner", "Security"]
        : ["checkin", "checkout"].includes(kind)
          ? ["Admin", "Security"]
          : [];
  const staff = roles.length
    ? await Account.find({ active: true, role: { $in: roles } }).select("email")
    : [];
  const recipients = new Set(
    [
      visit.creator,
      visit.hostEmail,
      ...staff.map((account) => account.email),
    ].filter(Boolean)
  );
  await Promise.all(
    [...recipients].map(async (recipient) => {
      const key = `${eventKey}:${recipient}`;
      try {
        await Notification.updateOne(
          { eventKey: key },
          {
            $setOnInsert: {
              eventKey: key,
              recipient,
              kind,
              message,
              visit: visit.id,
              read: false,
            },
          },
          { upsert: true }
        );
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    })
  );
}
let scanningOverstays = false;
async function scanOverstays() {
  if (scanningOverstays) return;
  scanningOverstays = true;
  try {
    const visits = await Visit.find({ status: "Checked in" });
    for (const visit of visits) {
      if (!visitView(visit).overstay) continue;
      const entry = visit.logs.at(-1);
      await notifyPeople(
        visit,
        "overstay",
        `${visit.name} is still on campus after the scheduled departure (${visit.endDate || visit.date} ${visit.endTime} IST).`,
        `overstay:${visit.id}:${entry?._id || entry?.in}`
      );
    }
  } finally {
    scanningOverstays = false;
  }
}
async function deliverEmails(sender = mailer) {
  if (!sender.isConfigured()) return;
  for (let i = 0; i < 10; i++) {
    const now = new Date();
    const notification = await Notification.findOneAndUpdate(
      {
        emailAttempts: { $lt: 5 },
        $or: [
          {
            emailState: "queued",
            $or: [
              { emailNextAttempt: { $exists: false } },
              { emailNextAttempt: { $lte: now } },
            ],
          },
          { emailState: "sending", emailLeaseUntil: { $lte: now } },
        ],
      },
      {
        $set: {
          emailState: "sending",
          emailLeaseUntil: new Date(Date.now() + 120000),
        },
        $inc: { emailAttempts: 1 },
      },
      { new: true, sort: { createdAt: 1 } }
    );
    if (!notification) break;
    try {
      await sender.send(notification);
      await Notification.updateOne(
        {
          _id: notification._id,
          emailState: "sending",
          emailAttempts: notification.emailAttempts,
        },
        {
          $set: { emailState: "sent", emailSentAt: new Date() },
          $unset: { emailLeaseUntil: 1, emailError: 1 },
        }
      );
    } catch {
      await Notification.updateOne(
        {
          _id: notification._id,
          emailState: "sending",
          emailAttempts: notification.emailAttempts,
        },
        {
          $set: {
            emailState: notification.emailAttempts >= 5 ? "failed" : "queued",
            emailNextAttempt: new Date(
              Date.now() + Math.min(60, 2 ** notification.emailAttempts) * 60000
            ),
            emailError:
              "Email delivery failed. Check the SMTP settings and provider.",
          },
          $unset: { emailLeaseUntil: 1 },
        }
      );
    }
  }
  // A worker interrupted during its last attempt must not leave a permanent sending status.
  await Notification.updateMany(
    {
      emailState: "sending",
      emailAttempts: { $gte: 5 },
      emailLeaseUntil: { $lte: new Date() },
    },
    {
      $set: {
        emailState: "failed",
        emailError:
          "Email delivery could not be confirmed after five attempts.",
      },
      $unset: { emailLeaseUntil: 1 },
    }
  );
}
function arrivalWindow(visit) {
  const day = dateInIndia();
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
  if (day < visit.date || day > (visit.endDate || visit.date))
    fail(400, "Entry is allowed only during the scheduled visit dates.");
  const current = day + "T" + time;
  if (
    current < visit.date + "T" + visit.time ||
    current > (visit.endDate || visit.date) + "T" + visit.endTime
  )
    fail(400, "Entry is outside the scheduled visit window.");
}
function passParts(qr) {
  if (typeof qr !== "string") fail(400, "Scan a valid visitor QR pass.");
  const parts = qr.trim().split("|");
  if (
    parts.length !== 3 ||
    parts[0] !== "VMS-PASS" ||
    !/^[a-f0-9]{64}$/.test(parts[2])
  )
    fail(400, "Invalid visitor pass.");
  return { id: parts[1], digest: hash(parts[2]) };
}
function visitInput(input, draft, user, original) {
  const result = {};
  for (const key of [
    "name",
    "email",
    "organization",
    "host",
    "hostEmail",
    "department",
    "purpose",
    "date",
    "endDate",
    "time",
    "endTime",
    "pickup",
  ]) {
    if (input[key] !== undefined && typeof input[key] !== "string")
      fail(400, "Invalid visit field.");
    result[key] = (input[key] || "").trim().slice(0, 200);
  }
  result.endDate = result.endDate || result.date;
  result.email = result.email.toLowerCase();
  result.hostEmail = result.hostEmail.toLowerCase();
  for (const key of ["transport", "accommodation", "spot"])
    result[key] = input[key] === true;
  if (result.spot && !["Admin", "Security"].includes(user.role))
    fail(403, "Only security or administrators can register a walk-in.");
  if (result.spot) {
    result.date = dateInIndia();
    result.endDate = result.date;
    result.endTime = "23:59";
    result.transport = false;
    result.accommodation = false;
  }
  if (!draft) {
    for (const key of [
      "name",
      "email",
      "organization",
      "host",
      "hostEmail",
      "department",
      "purpose",
      "date",
      "time",
      "endTime",
    ])
      if (!result[key]) fail(400, "Complete all required visit details.");
    for (const key of ["email", "hostEmail"])
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result[key]))
        fail(400, "Provide valid visitor and host emails.");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(result.date) ||
      !Number.isFinite(Date.parse(result.date)) ||
      result.date < dateInIndia() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(result.endDate) ||
      !Number.isFinite(Date.parse(result.endDate)) ||
      result.endDate < result.date
    )
      fail(400, "Select a current or future visit date.");
    if (
      ![result.time, result.endTime].every((t) =>
        /^([01]\d|2[0-3]):[0-5]\d$/.test(t)
      ) ||
      (result.endDate === result.date && result.endTime <= result.time)
    )
      fail(400, "Departure must be after arrival.");
    if (result.transport && !result.pickup)
      fail(400, "A pickup location is required.");
    if (!original || original.status === "Draft")
      result.status = "Pending approval";
  } else result.status = "Draft";
  return result;
}

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "64kb" }));
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
const api = express.Router();
api.get("/health", (req, res) =>
  res.json({ ready: mongoose.connection.readyState === 1 })
);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
});
api.post(
  "/auth/register",
  authLimiter,
  asyncRoute(async (req, res) => {
    const account = await createAccount(req.body, "Visitor");
    res.status(201).json({ user: accountView(account) });
  })
);
api.post(
  "/auth/login",
  authLimiter,
  asyncRoute(async (req, res) => {
    const account = await Account.findOne({
      email: String(req.body.email || "")
        .trim()
        .toLowerCase(),
      active: true,
    });
    const attempt = await scrypt(
      String(req.body.password || "").slice(0, 128),
      account?.salt || "invalid-login-salt",
      64
    );
    if (
      !account ||
      !crypto.timingSafeEqual(attempt, Buffer.from(account.password, "hex"))
    )
      fail(401, "Email or password is incorrect.");
    const raw = token();
    const csrf = token();
    await Session.create({
      tokenHash: hash(raw),
      account: account._id,
      csrf,
      expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
    });
    res.cookie(cookieName, raw, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.WORKSPACE_SECURE_COOKIES === "true",
      maxAge: 8 * 60 * 60 * 1000,
      path: "/api/workspace",
    });
    res.json({ user: accountView(account), csrf });
  })
);
api.use(
  asyncRoute(async (req, res, next) => {
    const cookies = Object.fromEntries(
      (req.headers.cookie || "")
        .split(";")
        .map((pair) => pair.trim().split("="))
    );
    const session =
      cookies[cookieName] &&
      (await Session.findOne({
        tokenHash: hash(cookies[cookieName]),
        expires: { $gt: new Date() },
      }).populate("account"));
    if (!session || !session.account?.active) fail(401, "Sign in to continue.");
    req.user = session.account;
    req.sessionRecord = session;
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.get("X-CSRF-Token") !== session.csrf
    )
      fail(403, "Invalid session verification. Please sign in again.");
    next();
  })
);
api.get("/auth/me", (req, res) =>
  res.json({ user: accountView(req.user), csrf: req.sessionRecord.csrf })
);
api.post(
  "/auth/logout",
  asyncRoute(async (req, res) => {
    await Session.deleteOne({ _id: req.sessionRecord._id });
    res.clearCookie(cookieName, { path: "/api/workspace" });
    res.json({ ok: true });
  })
);
api.post(
  "/auth/password",
  asyncRoute(async (req, res) => {
    const current = String(req.body.currentPassword || "");
    const nextPassword = req.body.newPassword;
    if (
      typeof nextPassword !== "string" ||
      nextPassword.length < 12 ||
      nextPassword.length > 128
    )
      fail(400, "Use a new password of 12–128 characters.");
    const attempt = await scrypt(current.slice(0, 128), req.user.salt, 64);
    if (!crypto.timingSafeEqual(attempt, Buffer.from(req.user.password, "hex")))
      fail(401, "Your current password is incorrect.");
    req.user.salt = token();
    req.user.password = (
      await scrypt(nextPassword, req.user.salt, 64)
    ).toString("hex");
    await req.user.save();
    await Session.deleteMany({
      account: req.user._id,
      _id: { $ne: req.sessionRecord._id },
    });
    await Audit.create({ actor: req.user.email, action: "change-password" });
    res.json({ ok: true });
  })
);
api.get(
  "/hosts",
  asyncRoute(async (req, res) =>
    res.json({
      hosts: (await Account.find({ role: "Host", active: true })).map(
        accountView
      ),
    })
  )
);
api.get(
  "/users",
  asyncRoute(async (req, res) => {
    if (req.user.role !== "Admin") fail(403, "Administrator access required.");
    res.json({
      users: (await Account.find().sort({ createdAt: -1 })).map(accountView),
    });
  })
);
api.post(
  "/users",
  asyncRoute(async (req, res) => {
    if (req.user.role !== "Admin") fail(403, "Administrator access required.");
    if (!ROLES.includes(req.body.role)) fail(400, "Invalid role.");
    const account = await createAccount(req.body, req.body.role);
    await Audit.create({ actor: req.user.email, action: "create-account" });
    res.status(201).json({ user: accountView(account) });
  })
);
api.patch(
  "/users/:id",
  asyncRoute(async (req, res) => {
    if (req.user.role !== "Admin") fail(403, "Administrator access required.");
    if (req.params.id === req.user.id)
      fail(400, "You cannot disable your own account.");
    const account = await Account.findById(req.params.id);
    if (!account) fail(404, "Account not found.");
    if (
      account.role === "Admin" &&
      req.body.active === false &&
      (await Account.countDocuments({ role: "Admin", active: true })) <= 1
    )
      fail(400, "Keep at least one active administrator.");
    if (typeof req.body.active !== "boolean")
      fail(400, "An active status is required.");
    account.active = req.body.active;
    await account.save();
    if (!account.active) await Session.deleteMany({ account: account._id });
    await Audit.create({ actor: req.user.email, action: "update-account" });
    res.json({ user: accountView(account) });
  })
);
api.get(
  "/visits",
  asyncRoute(async (req, res) =>
    res.json({
      visits: (await Visit.find(scope(req.user)).sort({ createdAt: -1 })).map(
        visitView
      ),
    })
  )
);
api.get(
  "/travel",
  asyncRoute(async (req, res) => {
    if (!["Admin", "Planner"].includes(req.user.role))
      fail(403, "Travel and accommodation access requires Admin or Planner.");
    const visits = await Visit.find({
      status: { $in: ["Approved", "Checked in", "Completed"] },
      $or: [{ transport: true }, { accommodation: true }],
    }).sort({ createdAt: -1 });
    res.json({
      visits: visits.map((doc) => {
        const view = visitView(doc);
        view.logs = [];
        return view;
      }),
    });
  })
);
api.get(
  "/movements",
  asyncRoute(async (req, res) => {
    if (!["Admin", "Security"].includes(req.user.role))
      fail(403, "Movement history access requires Security or Admin.");
    const visits = await Visit.find({
      status: { $in: ["Approved", "Checked in", "Completed"] },
    }).sort({ createdAt: -1 });
    res.json({ visits: visits.map(visitView) });
  })
);
api.post(
  "/visits",
  asyncRoute(async (req, res) => {
    if (!["Admin", "Visitor", "Host", "Security"].includes(req.user.role))
      fail(403, "This role cannot create visits.");
    const data = visitInput(req.body, req.body.draft === true, req.user);
    if (
      data.status !== "Draft" &&
      !(await Account.exists({
        email: data.hostEmail,
        role: "Host",
        active: true,
      }))
    )
      fail(400, "Choose a registered host email.");
    const visit = await Visit.create({
      ...data,
      id: "VMS-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      creator: req.user.email,
      logs: [],
    });
    await Audit.create({
      actor: req.user.email,
      action: "create-visit",
      visit: visit.id,
    });
    if (visit.status === "Pending approval")
      await Notification.create({
        recipient: visit.hostEmail,
        message: `${visit.name} requested a visit.`,
        visit: visit.id,
      });
    res.status(201).json({ visit: visitView(visit) });
  })
);
api.put(
  "/visits/:id",
  asyncRoute(async (req, res) => {
    const visit = await Visit.findOne({ id: req.params.id });
    if (!visit) fail(404, "Visit not found.");
    if (visit.creator !== req.user.email && req.user.role !== "Admin")
      fail(403, "You cannot edit this visit.");
    if (visit.status !== "Draft") fail(409, "Only drafts can be edited.");
    const data = visitInput(req.body, req.body.draft === true, req.user, visit);
    if (
      data.status !== "Draft" &&
      !(await Account.exists({
        email: data.hostEmail,
        role: "Host",
        active: true,
      }))
    )
      fail(400, "Choose a registered host email.");
    const updated = await Visit.findOneAndUpdate(
      { _id: visit._id, version: req.body.version },
      { $set: data, $inc: { version: 1 } },
      { new: true }
    );
    if (!updated) fail(409, "This visit changed. Refresh and try again.");
    await Audit.create({
      actor: req.user.email,
      action: "update-draft",
      visit: visit.id,
    });
    if (updated.status === "Pending approval")
      await Notification.create({
        recipient: updated.hostEmail,
        message: `${updated.name} requested a visit.`,
        visit: updated.id,
      });
    res.json({ visit: visitView(updated) });
  })
);
api.post(
  "/visits/:id/actions",
  asyncRoute(async (req, res) => {
    const v = await Visit.findOne({ id: req.params.id, ...scope(req.user) });
    if (!v) fail(404, "Visit not found.");
    const { action } = req.body;
    const changes = {};
    const allowed = (roles) => {
      if (!roles.includes(req.user.role))
        fail(403, "This role cannot perform that action.");
    };
    const status = (states) => {
      if (!states.includes(v.status))
        fail(409, "This action is not available for the current visit status.");
    };
    if (["approve", "decline"].includes(action)) {
      allowed(["Admin", "Host"]);
      if (req.user.role === "Host" && v.hostEmail !== req.user.email)
        fail(403, "Only the assigned host can decide this visit.");
      status(["Pending approval"]);
      changes.status = action === "approve" ? "Approved" : "Declined";
      if (action === "approve") {
        const pass = token();
        changes.passToken = pass;
        changes.passHash = hash(pass);
      }
    } else if (action === "cancel") {
      if (req.user.role !== "Admin" && v.creator !== req.user.email)
        fail(403, "Only the requester can cancel this visit.");
      status(["Pending approval", "Approved", "Draft"]);
      changes.status = "Cancelled";
      changes.passToken = null;
      changes.passHash = null;
    } else if (action === "plan") {
      allowed(["Admin", "Planner"]);
      status(["Approved"]);
      const plan = req.body.plan || {};
      for (const key of ["vehicle", "pickup", "stay"])
        if (plan[key] !== undefined && typeof plan[key] !== "string")
          fail(400, "Invalid arrangement.");
      if (v.transport && (!plan.vehicle?.trim() || !plan.pickup?.trim()))
        fail(400, "Complete transport arrangements.");
      if (v.accommodation && !plan.stay?.trim())
        fail(400, "Provide accommodation details.");
      changes.plan = {
        vehicle: (plan.vehicle || "").slice(0, 200),
        pickup: (plan.pickup || "").slice(0, 200),
        stay: (plan.stay || "").slice(0, 200),
      };
    } else if (action === "checkin") {
      allowed(["Admin", "Security"]);
      status(["Approved"]);
      if (req.body.identityVerified !== true)
        fail(400, "Confirm visitor identity before entry.");
      const scanned = passParts(req.body.qr);
      if (scanned.id !== v.id || scanned.digest !== v.passHash)
        fail(403, "The scanned pass does not authorize this visitor.");
      arrivalWindow(v);
      if (
        typeof req.body.assets !== "string" ||
        !req.body.assets.trim() ||
        req.body.assets.trim().length > 300
      )
        fail(400, "Record asset details, or explicitly record No assets.");
      changes.status = "Checked in";
      changes.logs = [
        ...v.logs.map((log) => log.toObject()),
        {
          in: new Date().toISOString(),
          out: null,
          assets: req.body.assets.trim(),
        },
      ];
    } else if (action === "checkout") {
      allowed(["Admin", "Security"]);
      status(["Checked in"]);
      const { assetResult, exitAssets, assetNotes, exitAuthorized } = req.body;
      if (
        !["matched", "discrepancy"].includes(assetResult) ||
        exitAuthorized !== true
      )
        fail(
          400,
          "Verify the outgoing assets and authorize departure before checkout."
        );
      if (
        assetResult === "discrepancy" &&
        (typeof exitAssets !== "string" ||
          !exitAssets.trim() ||
          exitAssets.trim().length > 300 ||
          typeof assetNotes !== "string" ||
          !assetNotes.trim() ||
          assetNotes.trim().length > 500)
      )
        fail(
          400,
          "Record outgoing assets and the discrepancy resolution (up to 500 characters)."
        );
      const last = v.logs.at(-1);
      if (!last || last.out)
        fail(409, "No active entry is available for checkout.");
      const verifiedAt = new Date().toISOString();
      changes.status = "Approved";
      changes.logs = v.logs.map((log, i) =>
        i === v.logs.length - 1
          ? {
              ...log.toObject(),
              out: verifiedAt,
              exitVerifiedAt: verifiedAt,
              exitVerifiedBy: req.user.email,
              assetResult,
              exitAssets:
                assetResult === "matched" ? log.assets : exitAssets.trim(),
              assetNotes:
                assetResult === "discrepancy" ? assetNotes.trim() : "",
            }
          : log.toObject()
      );
    } else if (action === "complete") {
      allowed(["Admin", "Security"]);
      status(["Approved"]);
      if (!v.logs.length)
        fail(400, "Record entry and exit before completing the visit.");
      changes.status = "Completed";
      changes.passToken = null;
      changes.passHash = null;
    } else fail(400, "Unknown visit action.");
    const updated = await Visit.findOneAndUpdate(
      { _id: v._id, version: req.body.version },
      { $set: changes, $inc: { version: 1 } },
      { new: true }
    );
    if (!updated) fail(409, "This visit changed. Refresh and try again.");
    await Audit.create({ actor: req.user.email, action, visit: v.id });
    const label = {
      approve: "approved; your QR pass is ready",
      decline: "declined",
      cancel: "cancelled",
      plan: "travel arrangements updated",
      checkin: "arrived on campus",
      checkout: "departed campus; assets verified",
      complete: "completed",
    }[action];
    await notifyPeople(
      updated,
      action,
      `${updated.name}: visit ${updated.id} ${label}.`,
      `visit:${updated.id}:${updated.version}`
    );
    if (action === "checkout" && req.body.assetResult === "discrepancy")
      await notifyPeople(
        updated,
        "asset-discrepancy",
        `${updated.name}: an asset discrepancy was reviewed and departure authorized by ${req.user.email}. See Movement History for the recorded resolution.`,
        `asset-discrepancy:${updated.id}:${updated.version}`
      );
    res.json({ visit: visitView(updated) });
  })
);
api.get(
  "/visits/:id/pass",
  asyncRoute(async (req, res) => {
    const v = await Visit.findOne({ id: req.params.id, ...scope(req.user) });
    if (!v) fail(404, "Visit not found.");
    if (!["Approved", "Checked in"].includes(v.status))
      fail(409, "A pass is available only for an approved active visit.");
    res.json({
      reference: v.id,
      qr: `VMS-PASS|${v.id}|${v.passToken}`,
      date: v.date,
    });
  })
);
api.post(
  "/verify-pass",
  asyncRoute(async (req, res) => {
    if (!["Admin", "Security"].includes(req.user.role))
      fail(403, "Security access required.");
    const scanned = passParts(req.body.qr);
    const v = await Visit.findOne({
      id: scanned.id,
      passHash: scanned.digest,
      status: { $in: ["Approved", "Checked in"] },
    });
    if (!v) fail(404, "Pass is invalid or revoked.");
    if (v.status === "Checked in")
      fail(
        409,
        "This visitor is already on campus. Record check-out before another entry."
      );
    arrivalWindow(v);
    res.json({ visit: visitView(v) });
  })
);
api.get(
  "/notifications",
  asyncRoute(async (req, res) =>
    res.json({
      emailDelivery: {
        enabled: mailer.enabled,
        configured: mailer.isConfigured(),
      },
      unreadCount: await Notification.countDocuments({
        recipient: req.user.email,
        read: false,
      }),
      notifications: await Notification.find({ recipient: req.user.email })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
    })
  )
);
api.patch(
  "/notifications/read",
  asyncRoute(async (req, res) => {
    await Notification.updateMany(
      { recipient: req.user.email, read: false },
      { $set: { read: true } }
    );
    res.json({ ok: true });
  })
);
api.patch(
  "/notifications/:id/read",
  asyncRoute(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      fail(404, "Notification not found.");
    const update = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.email },
      { $set: { read: true } },
      { new: true }
    );
    if (!update) fail(404, "Notification not found.");
    res.json({ notification: update });
  })
);
api.get(
  "/overstays",
  asyncRoute(async (req, res) => {
    if (!["Admin", "Security"].includes(req.user.role))
      fail(403, "Security or administrator access required.");
    const visits = await Visit.find({ status: "Checked in" }).sort({
      date: 1,
      endTime: 1,
    });
    res.json({
      visits: visits.map(visitView).filter((visit) => visit.overstay),
    });
  })
);
api.get(
  "/audit",
  asyncRoute(async (req, res) => {
    if (req.user.role !== "Admin") fail(403, "Administrator access required.");
    res.json({
      events: await Audit.find().sort({ createdAt: -1 }).limit(100).lean(),
    });
  })
);
app.use("/api/workspace", api);
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.code === 11000 ? 409 : error.status || 500;
  res.status(status).json({
    message:
      error.code === 11000
        ? "This email is already registered."
        : status >= 500
          ? "The server could not complete the request."
          : error.message,
  });
});

async function start() {
  await mongoose.connect(
    process.env.WORKSPACE_MONGODB_URI ||
      "mongodb://127.0.0.1:27017/vms_workspace"
  );
  await Promise.all([
    Account.init(),
    Session.init(),
    Visit.init(),
    Notification.init(),
  ]);
  const adminPassword = process.env.WORKSPACE_ADMIN_PASSWORD_B64
    ? Buffer.from(process.env.WORKSPACE_ADMIN_PASSWORD_B64, "base64").toString(
        "utf8"
      )
    : process.env.WORKSPACE_ADMIN_PASSWORD;
  if (
    !(await Account.exists({ role: "Admin" })) &&
    process.env.WORKSPACE_ADMIN_EMAIL &&
    adminPassword
  ) {
    await createAccount(
      {
        name: "Campus Administrator",
        email: process.env.WORKSPACE_ADMIN_EMAIL,
        password: adminPassword,
      },
      "Admin"
    );
  }
  const server = app.listen(
    Number(process.env.WORKSPACE_PORT || 8001),
    process.env.WORKSPACE_HOST || "127.0.0.1",
    () => console.log("Workspace API ready.")
  );
  const monitor = setInterval(
    () =>
      scanOverstays().catch(() =>
        console.error("Overstay monitoring failed; it will retry.")
      ),
    60000
  );
  const emailMonitor = setInterval(
    () =>
      deliverEmails().catch(() =>
        console.error("Email delivery worker failed; it will retry.")
      ),
    15000
  );
  emailMonitor.unref();
  deliverEmails().catch(() =>
    console.error("Initial email delivery failed; it will retry.")
  );
  monitor.unref();
  scanOverstays().catch(() =>
    console.error("Initial overstay scan failed; it will retry.")
  );
  server.on("close", () => {
    clearInterval(monitor);
    clearInterval(emailMonitor);
  });
  const shutdown = () => {
    clearInterval(monitor);
    clearInterval(emailMonitor);
    server.close(() => mongoose.disconnect().then(() => process.exit(0)));
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  return server;
}
if (require.main === module)
  start().catch(() => {
    console.error(
      "Workspace startup failed. Check the database and administrator configuration."
    );
    process.exit(1);
  });
module.exports = {
  app,
  start,
  Account,
  Visit,
  Session,
  Audit,
  Notification,
  scanOverstays,
  deliverEmails,
};
