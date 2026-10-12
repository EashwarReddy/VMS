const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { logger, securityLogger, auditLogger } = require("./configs/logger");
const passport = require("passport");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const { v4: uuidv4 } = require("uuid");
const { SESSION_COOKIE_OPTIONS } = require("./constants");
const configureCors = require("./configs/corsConfig");
const configurePassportStrategies = require("./configs/passportConfig");
const allowCredentials = require("./configs/allowCredentials");
const mongoSanitize = require("express-mongo-sanitize");
const { logAuditEvent } = require("./configs/audit");
// === APP INIT ===
const app = express();
app.set('trust proxy', true);
app.disable("etag");


// Import Routes
const userRouter = require("./routes/user.routes");
const VisitIndividualRouter = require("./routes/visitindividual.routes");
const AccommodationIndividualRouter = require("./routes/accomodationindividual.routes");
const ConveyanceRouter = require("./routes/conveyanceindividual.routes");
const ConveyanceOrgRouter = require("./routes/conveyanceorg.routes");
const DetailsRouter = require("./routes/details.routes");
const approvalCancelationRouter = require("./routes/approvalCancelation.routes");
const verifyScanDetailsRouter = require("./routes/verifyScanDetails.routes");
const visitorMovementRouter = require("./routes/visitorMovement.routes");
const facerecgonition = require("./routes/facerecognition.routes");
const hostRouter = require("./routes/host.routes");
const dashboardRouter = require("./routes/dashboard.routes");
// const { router: captchaRouter } = require("./routes/captcha.routes");
const { router: captchaRouter } = require("./routes/charcaptcha.routes");
const frontendRouter = require("./routes/frontendlogs.routes");
let io; // Declare io at the module level
const setSocketIO = (socketInstance) => { io = socketInstance; };

// === SECURITY MIDDLEWARE ==
// ✅ COMPREHENSIVE HELMET CONFIGURATION (Add this BEFORE other middleware)
// app.use(helmet({
//   // Content Security Policy
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", 'https://apis.google.com', 'https://www.google.com'],
//       styleSrc: ["'self'", 'https://fonts.googleapis.com'],
//       fontSrc: ["'self'", 'https://fonts.gstatic.com'],
//       imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
//       connectSrc: ["'self'", 'https://apis.google.com'],
//       frameSrc: ["'self'", 'https://www.google.com'],
//       objectSrc: ["'none'"],
//       upgradeInsecureRequests: [],
//       baseUri: ["'self'"],
//       formAction: ["'self'"],
//     },
//   },
  
//   // ✅ HSTS
//   hsts: {
//     maxAge: 31536000,
//     includeSubDomains: true,
//     preload: true
//   },
  
//   // ✅ X-Frame-Options
//   frameguard: {
//     action: 'deny'
//   },
  
//   // ✅ X-Content-Type-Options
//   noSniff: true,
  
//   // ✅ X-Download-Options
//   ieNoOpen: true,
  
//   // ✅ X-XSS-Protection (Enable it explicitly)
//   xssFilter: true,
  
//   // Referrer Policy
//   referrerPolicy: {
//     policy: 'strict-origin-when-cross-origin'
//   },
  
//   // X-Permitted-Cross-Domain-Policies
//   permittedCrossDomainPolicies: {
//     permittedPolicies: 'none'
//   },
  
//   // X-DNS-Prefetch-Control
//   dnsPrefetchControl: {
//     allow: false
//   },
  
//   // Cross-Origin Policies
//   crossOriginOpenerPolicy: {
//     policy: 'same-origin'
//   },
//   crossOriginResourcePolicy: {
//     policy: 'same-origin'
//   },
  
//   // Remove X-Powered-By
//   hidePoweredBy: true,
  
//   // Origin-Agent-Cluster
//   originAgentCluster: true,
// }));


// ✅ Browser Cache Security Middleware
// app.use((req, res, next) => {
//   // For sensitive routes (authentication, user data, payments)
//   if (
//     req.url.includes('/login') || 
//     req.url.includes('/register') ||
//     req.url.includes('/api/admin') ||
//     req.url.includes('/users') ||
//     req.url.includes('/payment') ||
//     req.url.includes('/profile')
//   ) {
//     // ✅ OWASP Recommended Headers for Sensitive Data
//     res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0, s-maxage=0, post-check=0, pre-check=0');
//     res.setHeader('Pragma', 'no-cache'); // HTTP/1.0 compatibility
//     res.setHeader('Expires', '0'); // Proxy compatibility
//   } else {
//     // For static resources (images, CSS, JS) - Allow caching with validation
//     res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate'); // 1 hour cache
//   }
  
//   next();
// });

// Block direct access to JSON files
app.use((req, res, next) => {
  if (req.path.endsWith('.json')) {
    return res.status(403).json({
      error: 'Access denied'
    });
  }
  next();
});

app.use(mongoSanitize());
app.use(allowCredentials);
configureCors(app);



// === RATE LIMIT ===
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10000,
  message: "Too many requests from this IP, try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    securityLogger.warn("Rate limit exceeded", {
      ip: req.ip,
      url: req.url,
      timestamp: new Date().toISOString(),
    });
    auditLogger.info("Security Event", {
      event: "rate_limit_exceeded",
      ip: req.ip,
      url: req.url,
      timestamp: new Date().toISOString(),
    });
    res.status(429).json({ error: "Too many requests" });
  },
});
app.use(limiter);

// Skip rate limit for login/refresh
const skipRateLimit = [
  "/captcha/captcha",
  "/api/v1/captcha/captcha",
  "/users/login",
  "/users/token/refresh",
  "/users/logout",
];

// Correct middleware
app.use((req, res, next) => {
  if (skipRateLimit.some(route => req.originalUrl.startsWith(route))) {
    return next(); // skip limiter
  }
  return limiter(req, res, next); // apply limiter ONLY when not skipped
});


// === Sanitize emails in URLs for all logs ===
function sanitizeUrl(url = "") {
  return url.replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    "[REDACTED_EMAIL]"
  );
}

// === Custom token for Morgan to hide emails ===
morgan.token("safe-url", (req) => sanitizeUrl(req.originalUrl));

// === JSON-style request log (custom Winston logger) ===
app.use((req, res, next) => {
  const sanitizedUrl = sanitizeUrl(req.url);
  const startTime = Date.now();

  logger.info(
    `Request received ${JSON.stringify({
      method: req.method,
      url: sanitizedUrl,
      ip: req.ip.replace("::ffff:", ""),
      userAgent: req.get("User-Agent"),
    })}`
  );

  // Track response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      url: sanitizedUrl,
      ip: req.ip.replace("::ffff:", ""),
      userAgent: req.get("User-Agent"),
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
    
    // ✅ REQUIREMENT 2: Log data modifications to audit trail
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      auditLogger.info('Data modification', {
        method: req.method,
        url: sanitizedUrl,
        ip: req.ip.replace("::ffff:", ""),
        userAgent: req.get("User-Agent"),
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    }
  });

  next();
});

// === Morgan HTTP access log (with sanitized URL) ===
app.use(
  morgan(
    ':remote-addr - - [:date[clf]] ":method :safe-url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
    {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }
  )
);

// === JSON parsing ===
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
// app.use(express.static('public', {
//   etag: false
// }));
app.use(cookieParser());

// === Attach Socket.io ===
app.use((req, res, next) => {
  req.io = io;
  next();
});

// === Suspicious Request Detector ===
app.use((req, res, next) => {
  const requestData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    body: req.body,
  };

  const suspiciousPatterns = [
    /(\<script|javascript:|vbscript:)/i, // XSS
    /(union\s+select|drop\s+table|insert\s+into)/i, // SQLi
    /(\.\.\/|\.\.\\)/i, // Path traversal
    /(\$ne|\$regex|\$where)/i, // NoSQL injection
  ];

  const dataStr = req.url + JSON.stringify(req.body || {});
  if (suspiciousPatterns.some((p) => p.test(dataStr))) {
    securityLogger.warn("Suspicious request detected", {
      ...requestData,
      severity: "medium",
    });
    auditLogger.info("Security Event", {
      event: "potential_attack",
      ...requestData,
      severity: "medium",
    });
  }
  next();
});

// === SESSION ===

const store = new MongoDBStore({
  uri: `${process.env.MONGODB_URI}/${process.env.DB_NAME}`,
  collection: "sessions",
});
store.on("error", (error) => logger.error(error));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    genid: () => uuidv4(),
    cookie: SESSION_COOKIE_OPTIONS,
    store: store,
  })
);

app.use(passport.initialize());
app.use(passport.session());
configurePassportStrategies();


// === AUTHENTICATION AUDIT ===
app.use((req, res, next) => {
  if (req.url.includes("/login") || req.url.includes("/register") || req.url.includes("/logout")) {
    auditLogger.info("Authentication Event", {
      event: req.url.includes("/login")
        ? "login_attempt"
        : req.url.includes("/register")
        ? "registration_attempt"
        : "logout_attempt",
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      url: req.url,
      timestamp: new Date().toISOString(),
    });
  }
  next();
});

// ✅ Block unwanted HTTP methods
app.use((req, res, next) => {
  const blockedMethods = ['HEAD', 'TRACE', 'TRACK', 'OPTIONS', 'CONNECT'];
  
  if (blockedMethods.includes(req.method)) {
    securityLogger.warn('Blocked unwanted HTTP method', {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      action: 'http_method_blocked'
    });
    
    auditLogger.info('Security Event', {
      event: 'blocked_insecure_http_method',
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    return res.status(405).json({ 
      error: 'Method Not Allowed' 
    });
  }
  
  next();
});

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/visit", VisitIndividualRouter);
app.use("/api/v1/accomodation", AccommodationIndividualRouter);
app.use("/api/v1/conveyance", ConveyanceRouter);
app.use("/api/v1/orgconveyance", ConveyanceOrgRouter);
app.use("/api/v1/checkdetails", DetailsRouter);
app.use("/api/v1/handleVisits", approvalCancelationRouter);
app.use("/api/v1/verifyScanDetails", verifyScanDetailsRouter);
app.use("/api/v1/movement", visitorMovementRouter);
app.use("/api/v1/host", hostRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/facerecognition", facerecgonition);
app.use("/api/v1/captcha", captchaRouter);
app.use("/api/v1/logs",frontendRouter);

// Error handling middleware with logging
app.use((error, req, res, next) => {
  const errorData = {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    userId: req.user?.email || 'anonymous',
    action: 'error_occurred'
  };
  
  logger.error('Application Error', errorData);
  auditLogger.error('Error Event', errorData);
  
  res.status(500).json({ error: 'Internal server error' });
});

// === 404 HANDLER ===
app.use((req, res) => {
  logger.warn("404 Not Found..", {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    action: '404_not_found'
  });
  res.status(404).json({ error: "Not found" });
});

app.get("/test", (req, res) => res.sendStatus(200));

module.exports = { app, setSocketIO };
