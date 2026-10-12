const { validationResult } = require("express-validator");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const getUserRoleId = require("../utils/getUserRoleId");
const {
  sendVerificationEmail,
  sendPasswordVerificationMail,
} = require("../utils/email/sendMail");
const User = require("../models/User.model");
const { encryptPassword, verifyPassword, decryptPasswordFromReqBody } = require("../utils/passwordUtil");
const { generateToken } = require("../utils/jwt/jwtUtil");
const {
  ACCESS_TOKEN_AGE,
  REFRESH_TOKEN_AGE,
  COOKIE_OPTIONS,
} = require("../constants");
const ResetTokenModel = require("../models/ResetToken.model");
const { default: axios } = require("axios");
const jwt = require("jsonwebtoken");
const {logger} = require("../configs/logger");
const { createUserRes } = require("../utils/createUserRes");
const path = require('path');
const fs = require('fs');
const SocketIDModel = require("../models/SocketID.model");
const crypto = require("crypto");
const VisitsModel = require("../models/Visits.model");
const Blacklist = require("../models/Blacklist.model");
const mongoose = require("mongoose");

const CryptoJS = require("crypto-js");
const { logAuditEvent } = require("../configs/audit");

const yup = require("yup");

// ✅ Email schema only
const emailSchema = yup.string()
  .email("Invalid email address")
  .required("Email is required")
  .test("not-cdac", "Email cannot be from @cdac.in", (value) => {
    return !value || !value.endsWith("@cdac.in");
  });
const emailSchemaRole = yup.string()
  .email("Invalid email address")
  .required("Email is required")
  .test("cdac-domain", "Only @cdac.in emails are allowed", (value) => {
    return value ? value.toLowerCase().endsWith("@cdac.in") : false;
  });

  const basicEmailSchema = yup
  .string()
  .email("Invalid email address")
  .required("Email is required");



  // ✅ Reference email schema (must be @cdac.in only)
const referenceEmailSchema = yup.string()
.email("Invalid reference email address")
.required("Reference email is required")
.test("cdac-only", "Reference email must be from @cdac.in", (value) => {
  return value && value.endsWith("@cdac.in");
});

const ENCRYPTION_KEY = process.env.SECRET_KEY_FOR_PASSWORD_DECRYPT;
const SPECIAL_ROLE_ID = "66f3e45505b4f6af77a5a11c";
const MAX_FAILED_ATTEMPTS = 3;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes


const UPLOAD_ROOT = path.resolve(__dirname, "../../uploads");

async function roleRegisterUser(req, res) {
  try {
    //#region Handling errors from express-validator
    const valRes = validationResult(req);
    // await emailSchemaRole.validate(req.body.email);
    if (req.body.role === SPECIAL_ROLE_ID) {
      // 🔹 Only email format validation
      await basicEmailSchema.validate(req.body.email);
    } else {
      // 🔹 Enforce @cdac.in
      await emailSchemaRole.validate(req.body.email);
    }
    const errorMessages = valRes.errors.map((element) => element.msg);
    if (errorMessages.length)
      return res.status(400).json(new ApiError(errorMessages));
    //#endregion

    // Check if the user already exists
    let userExists = await User.findOne({ email: req.body.email });
    if (userExists){
      logAuditEvent({
        event: "REGISTRATION_FAILED",
        userId:  req.user._id,
        userRole: req.user.role.name,
        ip: req.ip.replace("::ffff:", ""),
        url: req.originalUrl,
        userAgent: req.get("User-Agent"),
        reason: "EMAIL_ALREADY_REGISTERED"
      });
      return res.status(400).json(new ApiError(["Email already registered."]));
    }

    console.log("req.body.role: ", req.body?.role);

    // Assigning default role 'USER' to new user
    const userRoleId = req.body?.role ? req.body.role : await getUserRoleId();
    // const userRoleId = await getUserRoleId();
    if (!userRoleId) throw new Error("Role ID not found.");

     
    const encryptedPassword  = req.body.password;
    
    function decryptAES(encryptedText) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
      } catch (err) {
        console.error("Decryption error:", err);
        return null;
      }
    }

    const decryptedPassword = decryptAES(encryptedPassword);

    // Hashing the password
    const hashedPassword = await encryptPassword(decryptedPassword);

    // Check if file is uploaded
    if (!req.file) {
      return res
        .status(400)
        .json(new ApiError(["Profile photo is required."]));
    }

    // Save the uploaded file's path
    const profilePhotoPath = req.file.path;

    // Creating the user entry in the database
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      pincode: req.body.pincode,
      state: req.body.state,
      district: req.body.district,
      address: req.body.address,
      organisation: req.body.organisation,
      referenceEmail: req.body.referenceEmail,
      password: hashedPassword,
      role: userRoleId,
      lastLogin: Date.now(),
      profilePhoto: profilePhotoPath, // Save profile photo path
    });

    // Send verification email
    const emailInfo = await sendVerificationEmail(user);
    if (!emailInfo) {
      await User.findByIdAndDelete(user.id);
      throw new Error("Error occurred while sending verification email.");
    }
    console.log(`Email verification email sent. ID: ${emailInfo.messageId}`);

    logAuditEvent({
      event: "REGISTRATION_SUCCESS",
      userId:  req.user._id,
      userRole: req.user.role.name,
      ip: req.ip.replace("::ffff:", ""),
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      status: "SUCCESS",
    });

    return res
      .status(200)
      .json(new ApiResponse(null, "User created successfully!"));
  } catch (error) {
    logger.error(error);
    console.log(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}

async function registerUser(req, res) {
  try {
    //#region Handling errors from express-validator
    const valRes = validationResult(req);
    await emailSchema.validate(req.body.email);
    await referenceEmailSchema.validate(req.body.referenceEmail);
    const errorMessages = valRes.errors.map((element) => element.msg);
    if (errorMessages.length)
      return res.status(400).json(new ApiError(errorMessages));
    //#endregion

    // Check if the user already exists
    let userExists = await User.findOne({ email: req.body.email });
    if (userExists){
      if (userExists){
        logAuditEvent({
          event: "REGISTRATION_FAILED",
          ip: req.ip.replace("::ffff:", ""),
          url: req.originalUrl,
          userAgent: req.get("User-Agent"),
          reason: "EMAIL_ALREADY_REGISTERED"
        });
        return res.status(400).json(new ApiError(["Email already registered."]));
      }
      return res.status(400).json(new ApiError(["Email already registered."]));
    }

    console.log("req.body.role: ", req.body?.role);

    // Assigning default role 'USER' to new user
    //const userRoleId = req.body?.role ? req.body.role : await getUserRoleId();
    const userRoleId = await getUserRoleId();
    if (!userRoleId) throw new Error("Role ID not found.");

    const encryptedPassword  = req.body.password;
    
    function decryptAES(encryptedText) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
      } catch (err) {
        console.error("Decryption error:", err);
        return null;
      }
    }

    const decryptedPassword = decryptAES(encryptedPassword);

    // Hashing the password
    const hashedPassword = await encryptPassword(decryptedPassword);

    // Check if file is uploaded
    if (!req.file) {
      return res
        .status(400)
        .json(new ApiError(["Profile photo is required."]));
    }

    // Save the uploaded file's path
    const profilePhotoPath = req.file.path;

    // Creating the user entry in the database
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      pincode: req.body.pincode,
      state: req.body.state,
      district: req.body.district,
      address: req.body.address,
      organisation: req.body.organisation,
      referenceEmail: req.body.referenceEmail,
      password: hashedPassword,
      role: userRoleId,
      lastLogin: Date.now(),
      profilePhoto: profilePhotoPath, // Save profile photo path
    });

    // Send verification email
    const emailInfo = await sendVerificationEmail(user);
    if (!emailInfo) {
      await User.findByIdAndDelete(user.id);
      throw new Error("Error occurred while sending verification email.");
    }
    console.log(`Email verification email sent. ID: ${emailInfo.messageId}`);

    logAuditEvent({
      event: "REGISTRATION_SUCCESS",
      ip: req.ip.replace("::ffff:", ""),
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      status: "SUCCESS",
    });

    return res
      .status(200)
      .json(new ApiResponse(null, "User created successfully!"));
  } catch (error) {
    logger.error(error);
    console.log(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}

async function getUserById(req, res) {
  try {
    if (!req.params?.id)
      return res.status(400).json(new ApiError(["Id not found."]));

    //= Find the user in DB ==================================================

    const user = await User.findById(req.params.id, {
      password: 0,
      accessToken: 0,
      refreshToken: 0,
      __v: 0
    }).lean();

    if (!user) return res.status(404).json(new ApiError(["User not found."]));

    return res
      .status(200)
      .json(new ApiResponse(user, "User fetched successfull."));
  } catch (error) {
    logger.error(error);
    console.log(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}

async function verifyUser(req, res) {
  try {

       //#region handling errors from express-validator ####################################################################################################
       const valRes = validationResult(req);
       const errorMessages = valRes.errors.map((element) => element.msg);
       if (errorMessages.length)
         return res.status(400).json(new ApiError(errorMessages));
       const resetId = req.query.id;
 
       if (!resetId) {
        logger.error("Missing reset ID");
        return res.status(400).json(new ApiError(["Invalid request."]));
      }

    const record = await ResetTokenModel.findOne({resetId});

    if (record.used){
      logger.error("Link already used:");
      return res.status(400).json(new ApiError(["Link already used."]));
    }

    if (record.expiresAt < Date.now())
    {
      logger.error("Link expired:");
      return res.status(400).json(new ApiError(["Link expired."]));
    }

    // Verify JWT stored in DB
    const payload = jwt.verify(
      record.jwtToken,
      process.env.SECRET_KEY
    );

    const user = await User.findById(record.userId);
    if (!user) return res.status(404).json(new ApiError(["User not found."]));


    if (record.userId.toString() !== payload.userId)
      return res.status(403).json(new ApiError(["Unauthorized!"]));


    if (!user.isEmailVerified)
      await User.findByIdAndUpdate(
        user.id,
        { isEmailVerified: true },
        { new: true }
      );

    return res
      .status(200)
      .json(new ApiResponse(null, "User verification successfull."));
  } catch (error) {
    logger.error(error);
    console.log(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}

function isAccountLocked(user) {
  return user.lockUntil && user.lockUntil > Date.now();
}


async function loginUser(req, res) {
  try {
    //= find the user with the given username ====================================================================================================
    let user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).json(new ApiError([` Invalid User name or Password`]));

    const  userID = user._id;

    // 🔒 Check if account is locked
    if (isAccountLocked(user)) {
      return res.status(423).json(
        new ApiError([
          `Account is temporarily locked due to multiple failed login attempts. Please try again later.`,
        ])
      );
    }

    // Find existing socket entry for the user
    let socketEntry = await SocketIDModel.findOne({ userID });

    if (socketEntry) {
        // If an old socketID exists, send a "please logout" message
        if (socketEntry.socketID) {
            req.io.to(socketEntry.socketID).emit("logout", { message: "please logout" });
        }

        // Update the existing entry with socketID as null
        socketEntry.socketID = null;
        await socketEntry.save();
    } else {
        // Create a new entry with socketID as null
        socketEntry = await SocketIDModel.create({ userID, socketID: null });
    }

    const mylastlogin = user.lastLogin;

    //= Match the stored password and given password ====================================================================================================
    
    const { password } = req.body;
    
    function decryptAES(encryptedText) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
      } catch (err) {
        console.error("Decryption error:", err);
        return null;
      }
    }

    const decryptedPassword = decryptAES(password);
  
    
    const isPasswordCorrect = await verifyPassword(
      decryptedPassword,
      user.password
    );
    
    if (!isPasswordCorrect) {
      user.failedLoginAttempts += 1;
      user.lastFailedLogin = new Date();

      // 🔒 Lock account
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);

        logAuditEvent({
          event: "ACCOUNT_LOCKED",
          userId: user._id,
          userRole: user.role,
          ip: req.ip.replace("::ffff:", ""),
          url: req.originalUrl,
          status: "LOCKED",
        });
      }

      await user.save();

      logAuditEvent({
        event: "LOGIN_FAILURE",
        userId: user._id,
        userRole: user.role,
        ip: req.ip.replace("::ffff:", ""),
        url: req.originalUrl,
        userAgent: req.get("User-Agent"),
        status: "FAILURE",
      });

      return res.status(400).json(new ApiError([`Invalid User name or Password`]));
    }

    
    // ✅ RESET FAILED ATTEMPTS ON SUCCESS
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    //= Check if the user email is verified? ====================================================================================================
    if (!user.isEmailVerified)
      return res
        .status(401)
        .json(new ApiError([`Kindly verify your email first.`]));

    //= Check if the user email is enabled? ====================================================================================================
    if (!user.isEnabled)
      return res.status(401).json(new ApiError([`User is not enabled.`]));


    const sessionId = crypto.randomUUID();
    //= generate an access token ====================================================================================================
    const newAccessToken = generateToken(
      { userId: user._id ,sessionId,
        ip: req.ip,
        ua: req.headers["user-agent"],},
      { expiresIn: ACCESS_TOKEN_AGE,jwtid: new mongoose.Types.ObjectId().toString() }
    );

    // //= if user is loging in first time the there will be no refresh token ==================================================
    // if (!user?.refreshToken) {
    user.refreshToken = generateToken(
      { userId: user._id,sessionId,
        ip: req.ip,
        ua: req.headers["user-agent"], },
      { expiresIn: REFRESH_TOKEN_AGE,jwtid: new mongoose.Types.ObjectId().toString() }
    );
    // }

    //= updating accessTokens and refreshToken of the user in the DB ====================================================================================================
    user = await User.findByIdAndUpdate(
      user._id,
      {
        accessToken: newAccessToken,
        refreshToken: user.refreshToken,
        currentSessionId:sessionId,
        lastLogin: Date.now(),
      },
      {
        new: true,
      }
    );

    user.lastLogin = mylastlogin; // just to send correct last login in the response
    const userRes = createUserRes(user);

    // req.session.auth = user;

    res.cookie("rt", user.refreshToken, COOKIE_OPTIONS);

    logAuditEvent({
      event: "LOGIN_SUCCESS",
      userId: user._id,
      userRole: user.role,
      ip: req.ip.replace("::ffff:", ""),
      userAgent: req.get("User-Agent"),
      url: req.originalUrl,
      status: "SUCCESS",
    });

    return res
      .status(200)
      .json(new ApiResponse(userRes, "User logged in successfully!"));
      
  } catch (error) {
    logger.error(error);
    console.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}

// async function logoutUser(req, res) {
//   try {
//     const user = req.user;

//     //= Remove the tokens from the DB ====================================================================================================
//     await User.findByIdAndUpdate(
//       user.id,
//       { accessToken: null, refreshToken: null },
//       { new: true }
//     );
    
//     const socketEntry = await SocketIDModel.findOne({ userID : user.id });

//     if (!socketEntry) {
//         return res.status(404).json(new ApiError(['No active session found for this user.']));
//     }

//     // Remove the socket entry from the collection
//     await SocketIDModel.deleteOne({ userID : user.id });

//     // req.session.destroy();

//     // If refresh token cookie is also there remove it
//     if (req?.cookies?.rt) res.clearCookie("rt", COOKIE_OPTIONS);

//     return res
//       .status(200)
//       .json(new ApiResponse(null, "User logged out successfully!"));
//   } catch (error) {
//     logger.error(error);
//     console.log(error);
//     return res.status(500).json(new ApiError([error.message]));
//   }
// }


async function logoutUser(req, res) {
  try {
    const user = req.user;
    const token = req.headers.authorization?.split(" ")[1];

    // Revoke tokens in DB
    await User.findByIdAndUpdate(
      user.id,
      { accessToken: null, refreshToken: null , currentSessionId: null},
      { new: true }
    );

    // Blacklist the current token if exists
    if (token) {
      const decoded = jwt.decode(token);
      await Blacklist.create({
        token,
        expiresAt: new Date(decoded.exp * 1000)
      });
    }

    
    // Remove socket session
    await SocketIDModel.deleteOne({ userID: user.id });

    // Clear cookie if set
    if (req?.cookies?.rt) res.clearCookie("rt", { ...COOKIE_OPTIONS });

    logAuditEvent({
      event: "LOGOUT_SUCCESS",
      userId: req.userContext.userId,
      userRole: req.userContext.roleName,
      ip: req.ip.replace("::ffff:", ""),
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      status: "SUCCESS",
    });

    return res.status(200).json(new ApiResponse(null, "User logged out successfully!"));
  } catch (error) {
    logAuditEvent({
      event: "LOGOUT_FAILURE",
      userId: req.userContext?.userId || "UNKNOWN",
      userRole: req.userContext?.roleName || "UNKNOWN",
      ip: req.ip.replace("::ffff:", ""),
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      status: "FAILURE",
      meta: { error: error.message },
    });

    logger.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}


// async function sendPasswordResetEmail(req, res) {
//   try {
//     const valRes = validationResult(req);
//     const errorMessages = valRes.errors.map((element) => element.msg);
//     if (errorMessages.length)
//       return res.status(400).json(new ApiError(errorMessages));

//     const { email } = req.body;

//     // If email is empty/null, short-circuit immediately
//     if (!email) {
//       return res.status(200).json(
//         new ApiResponse(
//           null,
//           "If an account with that email exists, a password reset link has been sent."
//         )
//       );
//     }

//     const user = await User.findOne({ email });

//     if (
//       user &&
//       user.provider === "local" &&
//       user.isEmailVerified &&
//       user.isEnabled
//     ) {
//       try {
//         const emailInfo = await sendPasswordVerificationMail(user);
//         if (!emailInfo) {
//           await PasswordResetTokenModel.findOneAndDelete({ email: user.email });
//           logger.error("Error occurred while sending verification email.");
//         } else {
//           console.log(`Password Reset email sent. ID: ${emailInfo.messageId}`);
//         }
//       } catch (err) {
//         logger.error("Error sending reset email:", err);
//       }
//     }

//     // 👇 Always return generic response
//     return res.status(200).json(
//       new ApiResponse(
//         null,
//         "If an account with that email exists, a password reset link has been sent."
//       )
//     );

//   } catch (error) {
//     logger.error(error);
//     return res.status(500).json(new ApiError(["Something went wrong."]));
//   }
// }
async function sendPasswordResetEmail(req, res) {
  try {
    const valRes = validationResult(req);
    const errorMessages = valRes.errors.map((element) => element.msg);
    if (errorMessages.length) {
      return res.status(400).json(new ApiError(errorMessages));
    }

    const { email } = req.body;

    // 🔐 AUDIT — request received (always)
    logAuditEvent({
      event: "PASSWORD_RESET_REQUEST",
      userId: "ANONYMOUS",
      userRole: "UNAUTHENTICATED",
      ip: req.ip.replace("::ffff:", ""),
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      status: "ATTEMPT",
    });

    // Always respond generically
    if (!email) {
      return res.status(200).json(
        new ApiResponse(
          null,
          "If an account with that email exists, a password reset link has been sent."
        )
      );
    }

    const user = await User.findOne({ email });

    if (
      user &&
      user.provider === "local" &&
      user.isEmailVerified &&
      user.isEnabled
    ) {
      try {
        const emailInfo = await sendPasswordVerificationMail(user);

        if (emailInfo) {
          logAuditEvent({
            event: "PASSWORD_RESET_EMAIL_SENT",
            userId: user._id,
            userRole: user.role,
            ip: req.ip.replace("::ffff:", ""),
            url: req.originalUrl,
            userAgent: req.get("User-Agent"),
            status: "SUCCESS",
          });
        } else {
          logAuditEvent({
            event: "PASSWORD_RESET_EMAIL_FAILED",
            userId: user._id,
            userRole: user.role,
            ip: req.ip.replace("::ffff:", ""),
            url: req.originalUrl,
            userAgent: req.get("User-Agent"),
            reason: "EMAIL_SERVICE_FAILURE",
            status: "FAILED",
          });
        }
      } catch (err) {
        logger.error("Error sending reset email:", err);

        logAuditEvent({
          event: "PASSWORD_RESET_EMAIL_FAILED",
          userId: user._id,
          userRole: user.role,
          ip: req.ip.replace("::ffff:", ""),
          url: req.originalUrl,
          userAgent: req.get("User-Agent"),
          reason: "EXCEPTION",
          status: "FAILED",
        });
      }
    } else {
      // 👇 Eligible user not found — do NOT expose reason to client
      logAuditEvent({
        event: "PASSWORD_RESET_EMAIL_SKIPPED",
        userId: user?._id || "UNKNOWN",
        userRole: user?.role || "UNKNOWN",
        ip: req.ip.replace("::ffff:", ""),
        url: req.originalUrl,
        userAgent: req.get("User-Agent"),
        reason: "USER_NOT_ELIGIBLE",
        status: "SKIPPED",
      });
    }

    return res.status(200).json(
      new ApiResponse(
        null,
        "If an account with that email exists, a password reset link has been sent."
      )
    );

  } catch (error) {
    logger.error(error);

    logAuditEvent({
      event: "PASSWORD_RESET_REQUEST_FAILED",
      userId: "ANONYMOUS",
      userRole: "UNAUTHENTICATED",
      ip: req.ip.replace("::ffff:", ""),
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      reason: error.message,
      status: "ERROR",
    });

    return res.status(500).json(new ApiError(["Something went wrong."]));
  }
}


async function resetPassword(req, res) {
  try {
    const valRes = validationResult(req);
    const errorMessages = valRes.errors.map((element) => element.msg);
    if (errorMessages.length) {
      return res.status(400).json(new ApiError(errorMessages));
    }

    // 🔐 AUDIT — reset attempt
    logAuditEvent({
      event: "PASSWORD_RESET_ATTEMPT",
      userId: "UNKNOWN",
      userRole: "UNAUTHENTICATED",
      ip: req.ip.replace("::ffff:", ""),
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      status: "ATTEMPT",
    });

    const record = await ResetTokenModel.findOne({
      resetId: req.body.resetId,
    });

    if (!record) {
      logAuditEvent({
        event: "PASSWORD_RESET_FAILED",
        reason: "INVALID_RESET_ID",
        status: "FAILED",
      });
      return res.status(400).json(new ApiError(["Invalid request."]));
    }

    if (record.used) {
      logAuditEvent({
        event: "PASSWORD_RESET_FAILED",
        userId: record.userId,
        reason: "LINK_ALREADY_USED",
        status: "FAILED",
      });
      return res.status(400).json(new ApiError(["Link already used."]));
    }

    if (record.expiresAt < Date.now()) {
      logAuditEvent({
        event: "PASSWORD_RESET_FAILED",
        userId: record.userId,
        reason: "LINK_EXPIRED",
        status: "FAILED",
      });
      return res.status(400).json(new ApiError(["Link expired."]));
    }

    const payload = jwt.verify(record.jwtToken, process.env.SECRET_KEY);
    const user = await User.findById(record.userId);

    if (!user) {
      logAuditEvent({
        event: "PASSWORD_RESET_FAILED",
        userId: record.userId,
        reason: "USER_NOT_FOUND",
        status: "FAILED",
      });
      return res.status(404).json(new ApiError(["User not found."]));
    }

    if (payload.userId !== record.userId.toString()) {
      logAuditEvent({
        event: "PASSWORD_RESET_FAILED",
        userId: user._id,
        userRole: user.role,
        reason: "JWT_MISMATCH",
        status: "FAILED",
      });
      return res.status(403).json(new ApiError(["Unauthorized!"]));
    }

    if (!user.isEmailVerified || !user.isEnabled) {
      logAuditEvent({
        event: "PASSWORD_RESET_FAILED",
        userId: user._id,
        userRole: user.role,
        reason: "USER_NOT_ELIGIBLE",
        status: "FAILED",
      });
      return res.status(403).json(new ApiError(["User not eligible."]));
    }

    const decryptedPassword = decryptPasswordFromReqBody(
      req.body.password,
      process.env.IV,
      process.env.SECRET_KEY_FOR_PASSWORD_DECRYPT
    );

    const isPasswordCorrect = await verifyPassword(
      decryptedPassword,
      user.password
    );

    if (isPasswordCorrect) {
      logAuditEvent({
        event: "PASSWORD_RESET_FAILED",
        userId: user._id,
        userRole: user.role,
        reason: "PASSWORD_REUSE",
        status: "FAILED",
      });
      return res
        .status(400)
        .json(new ApiError(["New password can not be same as current password."]));
    }

    const hashedPassword = await encryptPassword(decryptedPassword);

    // await User.findByIdAndUpdate(
    //   record.userId,
    //   { password: hashedPassword, accessToken: null, refreshToken: null },
    //   { new: true }
    // );
    await User.findByIdAndUpdate(
      record.userId,
      {
        password: hashedPassword,
    
        // 🔐 Invalidate all sessions
        accessToken: null,
        refreshToken: null,
        currentSessionId: null,
    
        // 🔓 UNLOCK ACCOUNT AFTER PASSWORD RESET
        failedLoginAttempts: 0,
        lockUntil: null,
  
      },
      { new: true }
    );
    

    record.used = true;
    await record.save();

    // ✅ AUDIT — success
    logAuditEvent({
      event: "PASSWORD_RESET_SUCCESS",
      userId: user._id,
      userRole: user.role,
      ip: req.ip.replace("::ffff:", ""),
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      status: "SUCCESS",
    });

    return res
      .status(200)
      .json(new ApiResponse(null, "Password reset successful."));

  } catch (error) {
    logger.error(error);

    logAuditEvent({
      event: "PASSWORD_RESET_ERROR",
      reason: error.message,
      status: "ERROR",
    });

    return res.status(500).json(new ApiError([error.message]));
  }
}

// async function handleRefreshToken(req, res) {
//   //= Extract tokens from req headers ==================================================
//   const refreshToken = req?.cookies?.rt;

//   //= If any one of them is not found? :send error ==================================================
//   if (!refreshToken)
//     return res.status(400).json(new ApiError([`Token not found.`]));

//   try {
//     //= Verify refresh token ==================================================
//     const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
//     console.log(
//       "🚀 ~ file: user.controller.js:325 ~ handleRefreshToken ~ payload:",
//       payload
//     );

//     //= Find the user of the token ==================================================
//     let user = await User.findById(payload?.userId);

//     //= If payload userId is altered and user not found with the right refersh token & user doesn't have the access token comming in req? :send error ==================================================
//     if (!user || !user.accessToken || user.refreshToken !== refreshToken)
//       return res.status(403).json(new ApiError([`Forbidden!`]));

//     //= Generate a new access token ====================================================================================================
//     const newAccessToken = generateToken(
//       { userId: user.id },
//       { expiresIn: ACCESS_TOKEN_AGE }
//     );

//     //#region If refresh token is about to expire ====================================================================================================
//     // Expiration time in seconds since Unix epoch
//     const expirationTimeInSeconds = payload.exp;

//     // Current time in seconds since Unix epoch
//     const currentTimeInSeconds = Math.floor(Date.now() / 1000);

//     // Set a threshold (e.g., 30 minutes) for considering the token as "about to expire"
//     const thresholdInSeconds = 30 * 60;

//     // Check if the token is about to expire
//     if (expirationTimeInSeconds - currentTimeInSeconds < thresholdInSeconds) {
//       console.log("The JWT token is about to expire soon.");

//       user.refreshToken = generateToken(
//         { userId: user.id },
//         { expiresIn: REFRESH_TOKEN_AGE }
//       );
//     }
//     //#endregion If refresh token is about to expire =================================================================================================

//     //= Updating accessTokens of the user in the DB ====================================================================================================
//     user = await User.findByIdAndUpdate(
//       user.id,
//       {
//         accessToken: newAccessToken,
//         refreshToken: user.refreshToken,
//       },
//       {
//         new: true,
//       }
//     );

//     // Update the cookie
//     res.cookie("rt", user.refreshToken, COOKIE_OPTIONS);

//     return res
//       .status(200)
//       .json(new ApiResponse({ newAccessToken }, "Token refresh successfull."));
//   } catch (error) {
//     // console.log("🚀 ~ file: user.controller.js:673 ~ handleRefreshToken ~ error:", JSON.stringify(error))
//     if (error.name === "TokenExpiredError") {
//       try {
//         const user = await User.findOne({ refreshToken });

//         if (!user) return res.status(403).json(new ApiError([`Forbidden!`]));

//         //= Just remove all the accessTokens and refreshToken ==================================================
//         await User.findByIdAndUpdate(
//           user.id,
//           {
//             accessToken: null,
//             refreshToken: null,
//           },
//           {
//             new: true,
//           }
//         );

//         return res.status(400).json(new ApiResponse(null, "Try login again."));
//       } catch (err) {
//         error = err;
//       }
//     }

//     logger.error(error);
//     console.log(
//       "🚀 ~ file: user.controller.js:407 ~ handleRefreshToken ~ error:",
//       error
//     );
//     return res.status(500).json(new ApiError([error.message]));
//   }
// }

async function handleRefreshToken(req, res) {
  try {
    const refreshToken = req.cookies?.rt;
    if (!refreshToken)
      return res.status(400).json(new ApiError(["Token not found"]));

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json(new ApiError(["Invalid or expired token"]));
    }

    // 1. Find user
    let user = await User.findById(payload?.userId);
    if (!user) return res.status(403).json(new ApiError(["Forbidden"]));

    // 2. Check if the stored refresh matches cookie (rotation protection)
    if (!user || !user.accessToken || user.refreshToken !== refreshToken)
      return res.status(403).json(new ApiError(["Token mismatch"]));

    // 3. Check if sessionId matches
    if (user.currentSessionId !== payload.sessionId)
      return res.status(403).json(new ApiError(["Session expired"]));

    // 4. Check IP & UA
    if (payload.ip !== req.ip || payload.ua !== req.headers["user-agent"])
      return res.status(403).json(new ApiError(["Token used from different device"]));

    // 5. Create New Access Token
    const newAccessToken = generateToken(
      {
        userId: user.id,
        sessionId: user.currentSessionId,
        ip: req.ip,
        ua: req.headers["user-agent"],
      },
      { expiresIn: ACCESS_TOKEN_AGE }
    );

    // 6. Rotate Refresh Token
    const expiresSoon =
      payload.exp - Math.floor(Date.now() / 1000) < 30 * 60; // 30 minutes

    if (expiresSoon) {
      user.refreshToken = generateToken(
        {
          userId: user.id,
          sessionId: user.currentSessionId,
          ip: req.ip,
          ua: req.headers["user-agent"],
        },
        { expiresIn: REFRESH_TOKEN_AGE }
      );

      res.cookie("rt", user.refreshToken, COOKIE_OPTIONS);
    }

    // 7. Save tokens
    user.accessToken = newAccessToken;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse({ newAccessToken }, "Token refresh successful"));
  } catch (error) {
    // console.log("🚀 ~ file: user.controller.js:673 ~ handleRefreshToken ~ error:", JSON.stringify(error))
    if (error.name === "TokenExpiredError") {
      try {
        const user = await User.findOne({ refreshToken });

        if (!user) return res.status(403).json(new ApiError([`Forbidden!`]));

        //= Just remove all the accessTokens and refreshToken ==================================================
        await User.findByIdAndUpdate(
          user.id,
          {
            accessToken: null,
            refreshToken: null,
          },
          {
            new: true,
          }
        );

        return res.status(400).json(new ApiResponse(null, "Try login again."));
      } catch (err) {
        error = err;
      }
    }

    logger.error(error);
    console.log(
      "🚀 ~ file: user.controller.js:407 ~ handleRefreshToken ~ error:",
      error
    );
    return res.status(500).json(new ApiError([error.message]));
  }
}


async function sendUserDetails(req, res) {
  try {
    //= Find the user in DB ==================================================
    const user = req.user;

    const userRes = createUserRes(user);

    return res
      .status(200)
      .json(new ApiResponse(userRes, "User details fetched successfully!"));
  } catch (error) {
    logger.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}

async function sendAllUsersDetails(req, res) {
  try {
    //= Find the user in DB ==================================================
    const users = await User.find({}, {
      password: 0,
      accessToken: 0,
      refreshToken: 0,
      __v: 0
    }).lean();

    return res
      .status(200)
      .json(new ApiResponse(users, "Users details fetched successfully!"));
  } catch (error) {
    logger.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}


async function enableOrDisableUserById(req, res) {
  try {
    if (!req.params?.id)
      return res.status(400).json(new ApiError(["Id not found."]));

    //= Find the user in DB ==================================================
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isEnabled: req.body.isEnabled,
      },
      { new: true }
    );

    if (!user)
      return res
        .status(400)
        .json(new ApiError(["user with given Id not found."]));

    return res
      .status(200)
      .json(new ApiResponse(user, "User updated successfully!"));
  } catch (error) {
    logger.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}
async function uploadProfilePhoto(req, res) {
  try {
    if (!req.params?.id) {
      return res.status(400).json(new ApiError(["Id not found."]));
    }

    if (!req.file) {
      return res.status(400).json(new ApiError(["No file uploaded."]));
    }

    const profileDir = path.join(UPLOAD_ROOT, "profilePhotos");

    // Ensure directory exists
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true, mode: 0o750 });
    }

    // File already saved by multer → just record path
    const relativePath = `profilePhotos/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePhoto: relativePath },
      { new: true }
    );

    if (!user) {
      return res.status(404).json(new ApiError(["User with given Id not found."]));
    }

    return res.status(200).json(
      new ApiResponse("Profile photo updated successfully!")
    );
  } catch (error) {
    logger.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}


async function getProfilePhoto(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.profilePhoto) {
      return res.status(404).json(new ApiError(["Profile photo not found."]));
    }

    const absolutePath = path.join(UPLOAD_ROOT, user.profilePhoto);

    if (!absolutePath.startsWith(UPLOAD_ROOT) || !fs.existsSync(absolutePath)) {
      return res.status(404).json(new ApiError(["Profile photo not found."]));
    }

    return res.sendFile(absolutePath);
  } catch (error) {
    logger.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}


async function getVisitPhoto(req, res) {
  try {
    // Check if the user ID is provided
    if (!req.params?.id) {
      return res.status(400).json(new ApiError(["Id not found."]));
    }

    // Find the user by ID
    const visit = await VisitsModel.findOne({pnr : req.params.id});

    // If no user found, return an error response
    if (!visit) {
      return res.status(404).json(new ApiError(["User with given Id not found."]));
    }

    // Check if the profilePhoto field exists
    if (!visit.image) {
      return res.status(404).json(new ApiError(["visitor photo not found."]));
    }

    // Get the file path from the profilePhoto field (relative path)
    const photoPath = path.join(__dirname,"../../uploads/visitorsPhotos/" ,visit.image); // Resolves to the absolute path of the photo file

    console.log("VisitPhotoPath....................",photoPath)
    // Send the image file as a response
    return res.sendFile(photoPath); // Sends the image file directly to the client

  } catch (error) {
    // Log error and return 500 status
    console.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}


module.exports = {
  roleRegisterUser,
  registerUser,
  getUserById,
  verifyUser,
  loginUser,
  logoutUser,
  sendPasswordResetEmail,
  resetPassword,
  handleRefreshToken,
  sendUserDetails,
  sendAllUsersDetails,
  enableOrDisableUserById,
  uploadProfilePhoto,
  getProfilePhoto,
  getVisitPhoto

};