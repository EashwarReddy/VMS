const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Captcha = require("../models/Captcha");
const { logger, securityLogger } = require("../configs/logger"); 
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");

const router = express.Router();

const ipCaptchaCounts = {};
const MAX_CAPTCHA_PER_IP = 25;
const CAPTCHA_WINDOW_MS = 2 * 60 * 1000;
const MAX_ATTEMPTS_PER_CAPTCHA = 10;


const crypto = require("crypto");

function generateCaptchaText() {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const NUMBERS = "0123456789";
  const ALL = LETTERS + NUMBERS;

  let captcha = "";

  // Ensure at least one letter
  captcha += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));

  // Ensure at least one number
  captcha += NUMBERS.charAt(Math.floor(Math.random() * NUMBERS.length));

  // Remaining characters
  for (let i = 2; i < 6; i++) {
    captcha += ALL.charAt(Math.floor(Math.random() * ALL.length));
  }

  // Shuffle characters
  return captcha
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

function hashCaptcha(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}



// ✅ Generate captcha
router.get("/captcha", async (req, res) => {
  const ip = req.ip;

  try {
    if (!ipCaptchaCounts[ip]) {
      ipCaptchaCounts[ip] = { count: 0, firstRequestAt: new Date() };
    }

    const now = new Date();
    const elapsed = now - ipCaptchaCounts[ip].firstRequestAt;

    if (elapsed > CAPTCHA_WINDOW_MS) {
      ipCaptchaCounts[ip] = { count: 0, firstRequestAt: now };
    }

    if (ipCaptchaCounts[ip].count >= MAX_CAPTCHA_PER_IP) {
      // Log excessive requests for security monitoring
      securityLogger.warn(`Too many captcha requests from IP: ${ip}`);
      return res.status(429).json({
        success: false,
        message: "Too many captcha requests from your IP, try again later",
      });
    }

    ipCaptchaCounts[ip].count += 1;

    // Generate captcha
    const captchaText = generateCaptchaText();
    const hashedAnswer = hashCaptcha(captchaText);
    
    const captchaId = uuidv4();
    await Captcha.create({
      captchaId,
      answer: hashedAnswer, // store hashed
      ip,
      attempts: 0,
    });
    
    logger.info(`Captcha created for IP: ${ip}`);
    res.json({ captchaId, captcha: captchaText });
   // return res.json(new ApiResponse({ captchaId, question }, "Captcha generated successfully"));
  } catch (error) {
    logger.error(`Error generating captcha for IP: ${ip}`);
    return res.status(500).json(new ApiError(["Failed to generate captcha"]));
  }
});

// ✅ Verify captcha
router.post("/verify-captcha", async (req, res) => {
  const { captchaId, userAnswer } = req.body;
  const ip = req.ip;

  try {
    const captcha = await Captcha.findOne({ captchaId });
    if (!captcha) {
      securityLogger.warn(`Invalid captcha or request: ${ip}`);
      return res.status(400).json(new ApiError(["Invalid captcha or request"]));
    }

    const hashedInput = hashCaptcha(userAnswer);

    if (hashedInput !== captcha.answer) {
      captcha.attempts += 1;
    
      if (captcha.attempts >= MAX_ATTEMPTS_PER_CAPTCHA) {
        await Captcha.deleteOne({ captchaId });
        securityLogger.warn(
          `Captcha ${captchaId} expired after max attempts from IP: ${ip}`
        );
      } else {
        await captcha.save();
      }
    
      await new Promise((r) => setTimeout(r, 1000));
      logger.warn(`Incorrect captcha attempt for ${captchaId} from IP: ${ip}`);
      return res.status(400).json(new ApiError(["Invalid captcha or request"]));
    }

    await Captcha.deleteOne({ captchaId });
    if (req.session) req.session.captchaVerified = true;

    logger.info(`Captcha verified successfully for IP: ${ip}`);
    res.json({ success: true });
    //return res.json(new ApiResponse({ success: true }, "Captcha verified successfully"));
  } catch (error) {
    logger.error(`Error verifying captcha (ID: ${captchaId}) from IP: ${ip}`);
    return res.status(500).json(new ApiError(["Error verifying captcha"]));
  }
});

// ✅ Middleware to enforce captcha
function requireCaptcha(req, res, next) {
  if (req.session && req.session.captchaVerified) {
    delete req.session.captchaVerified;
    return next();
  }
  securityLogger.warn(`Captcha verification required for IP: ${req.ip}`);
  return res.status(403).json(new ApiError(["Captcha verification required"]));
}

module.exports = { router, requireCaptcha };
