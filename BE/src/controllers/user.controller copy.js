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
const PasswordResetTokenModel = require("../models/PasswordResetToken.model");
const { default: axios } = require("axios");
const jwt = require("jsonwebtoken");
const logger = require("../configs/logger");
const { createUserRes } = require("../utils/createUserRes");
const path = require('path');
const fs = require('fs');
const SocketIDModel = require("../models/SocketID.model");
const { randomUUID } = require("node:crypto");
const VisitsModel = require("../models/Visits.model");

// Role-to-dashboard mapping
const ROLE_DASHBOARD = {
  Admin: "/dashboard",
  Planner: "/dashboardplanner",
  Visitor: "/standard",
  Host: "/standard",
  SecurityGuard: "/spotRegistration",
};


async function registerUser(req, res) {
  try {
    //#region Handling errors from express-validator
    const valRes = validationResult(req);
    const errorMessages = valRes.errors.map((element) => element.msg);
    if (errorMessages.length)
      return res.status(400).json(new ApiError(errorMessages));
    //#endregion

    // Check if the user already exists
    let userExists = await User.findOne({ email: req.body.email });
    if (userExists)
      return res.status(400).json(new ApiError(["Email already registered."]));

    console.log("req.body.role: ", req.body?.role);

    // Assigning default role 'USER' to new user
    const userRoleId = req.body?.role ? req.body.role : await getUserRoleId();
    if (!userRoleId) throw new Error("Role ID not found.");

    // Hashing the password
    const hashedPassword = await encryptPassword(req.body.password);

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
    const user = await User.findById(req.params.id);

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
    const user = await User.findById(req.payload?.userId);
    if (!user) return res.status(404).json(new ApiError(["User not found."]));

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

async function loginUser(req, res) {
  try {
    //= find the user with the given username ====================================================================================================
    const user = await User.findOne({ email: req.body.email }).populate("role");

    if (!user) return res.status(400).json(new ApiError([`User not found.`]));

    const  userID = user._id;

    if (!userID) {
        return res.status(400).json(new ApiError(['userID is required.']));
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
  //   const { recaptcha } = req.body;
  //   const { "cf-turnstile-response": captchaToken } = req.body;
  //   console.log("req.body",req.body)
  // if (!captchaToken) {
  //   return res.status(400).json({ message: "Captcha is required." });
  // }

//= Matching reCaptacha and verifying

 // ✅ Verify captcha with Cloudflare
//  const verifyURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
//  const { data } = await axios.post(
//    verifyURL,
//    new URLSearchParams({
//      secret: process.env.CLOUD_SITE_KEY,
//      response: captchaToken,
//    }),
//    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//  );

//  if (!data.success) {
//    return res.status(400).json({ message: "Captcha verification failed." });
//  }



// try {
//   // Sending secret key and response token to Google Recaptcha API for authentication.
//   const response = await axios.post(
//     `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${recaptcha}`
//   );

//   // Check response status and send back to the client-side
//   if (!response.data.success) {
//     return res.status(400).json(new ApiError([`Error verifying reCaptcha`]));
//   }
//   console.log('the token is valid', response.data)


// } catch (error) {
//   // Handle any errors that occur during the reCAPTCHA verification process
//   console.error(error);
//   res.status(500).send("Error verifying reCAPTCHA");
//  }

    //= Match the stored password and given password ====================================================================================================
    
    const { password } = req.body;

    const decryptedPassword = decryptPasswordFromReqBody(
      password,
      process.env.IV,
      process.env.SECRET_KEY_FOR_PASSWORD_DECRYPT
    );
    
    const isPasswordCorrect = await verifyPassword(
      decryptedPassword,
      user.password
    );
    
    if (!isPasswordCorrect)
      return res.status(400).json(new ApiError([`Wrong password.`]));

    //= Check if the user email is verified? ====================================================================================================
    if (!user.isEmailVerified)
      return res
        .status(401)
        .json(new ApiError([`Kindly verify your email first.`]));

    //= Check if the user email is enabled? ====================================================================================================
    if (!user.isEnabled)
      return res.status(401).json(new ApiError([`User is not enabled.`]));

    //= generate an access token ====================================================================================================
    const newAccessToken = generateToken(
      { userId: user._id,
        role: user.role },
      { expiresIn: ACCESS_TOKEN_AGE }
    );

    // //= if user is loging in first time the there will be no refresh token ==================================================
    // if (!user?.refreshToken) {
      const newRefreshToken= generateToken(
      { userId: user._id },
      { expiresIn: REFRESH_TOKEN_AGE }
    );
    // }

     // Save tokens
     user.accessToken = newAccessToken;
     user.refreshToken = newRefreshToken;
     const prevLastLogin = user.lastLogin;
     user.lastLogin = new Date();
     await user.save();
 
     const userRes = createUserRes(user);
     userRes.lastLogin = prevLastLogin;

    // req.session.auth = user;

    res.cookie("rt", newRefreshToken, COOKIE_OPTIONS);

    return res
      .status(200)
      .json(new ApiResponse(userRes, "User logged in successfully!"));
      
  } catch (error) {
    logger.error(error);
    console.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}

// async function loginUser(req, res) {
//   try {
//     //= find the user with the given username ====================================================================================================
//     let user = await User.findOne({ email: req.body.email }).populate("role");

//     if (!user) return res.status(400).json(new ApiError([`User not found.`]));

//     const  userID = user._id;

//     if (!userID) {
//         return res.status(400).json(new ApiError(['userID is required.']));
//     }

//     // Find existing socket entry for the user
//     let socketEntry = await SocketIDModel.findOne({ userID });

//     if (socketEntry) {
//         // If an old socketID exists, send a "please logout" message
//         if (socketEntry.socketID) {
//             req.io.to(socketEntry.socketID).emit("logout", { message: "please logout" });
//         }

//         // Update the existing entry with socketID as null
//         socketEntry.socketID = null;
//         await socketEntry.save();
//     } else {
//         // Create a new entry with socketID as null
//         socketEntry = await SocketIDModel.create({ userID, socketID: null });
//     }

//     const mylastlogin = user.lastLogin;


//     //= Match the stored password and given password ====================================================================================================
    
//     const { password } = req.body;

//     const decryptedPassword = decryptPasswordFromReqBody(
//       password,
//       process.env.IV,
//       process.env.SECRET_KEY_FOR_PASSWORD_DECRYPT
//     );
    
//     const isPasswordCorrect = await verifyPassword(
//       decryptedPassword,
//       user.password
//     );
    
//     if (!isPasswordCorrect)
//       return res.status(400).json(new ApiError([`Wrong password.`]));

//     //= Check if the user email is verified? ====================================================================================================
//     if (!user.isEmailVerified)
//       return res
//         .status(401)
//         .json(new ApiError([`Kindly verify your email first.`]));

//     //= Check if the user email is enabled? ====================================================================================================
//     if (!user.isEnabled)
//       return res.status(401).json(new ApiError([`User is not enabled.`]));


//      // Extract role name (from populated role doc)
//      const roleName = user.role?.name || "Visitor";


//     //= generate an access token ====================================================================================================

//     const newAccessToken = generateToken(
//       { sub: user.id, role: roleName },
//       { expiresIn: ACCESS_TOKEN_AGE }
//     );

//     // //= if user is loging in first time the there will be no refresh token ==================================================
//     // if (!user?.refreshToken) {
//     user.refreshToken = generateToken(
//       { userId: user.id },
//       { expiresIn: REFRESH_TOKEN_AGE }
//     );
//     // }

//     //= updating accessTokens and refreshToken of the user in the DB ====================================================================================================
//     user = await User.findByIdAndUpdate(
//       user.id,
//       {
//         accessToken: newAccessToken,
//         refreshToken: user.refreshToken,
//         lastLogin: Date.now(),
//       },
//       {
//         new: true,
//       }
//     );

//     user.lastLogin = mylastlogin; // just to send correct last login in the response
//     const userRes = createUserRes(user);

//     // req.session.auth = user;

//     res.cookie("rt", user.refreshToken, COOKIE_OPTIONS);

//     return res
//       .status(200)
//       .json(new ApiResponse(userRes, "User logged in successfully!"));
      
//   } catch (error) {
//     logger.error(error);
//     console.error(error);
//     return res.status(500).json(new ApiError([error.message]));
//   }
// }

async function logoutUser(req, res) {
  try {
    const user = req.user;

    //= Remove the tokens from the DB ====================================================================================================
    await User.findByIdAndUpdate(
      user.id,
      { accessToken: null, refreshToken: null },
      { new: true }
    );
    
    const socketEntry = await SocketIDModel.findOne({ userID : user.id });

    if (!socketEntry) {
        return res.status(404).json(new ApiError(['No active session found for this user.']));
    }

    // Remove the socket entry from the collection
    await SocketIDModel.deleteOne({ userID : user.id });

    // req.session.destroy();

    // If refresh token cookie is also there remove it
    if (req?.cookies?.rt) res.clearCookie("rt", COOKIE_OPTIONS);

    return res
      .status(200)
      .json(new ApiResponse(null, "User logged out successfully!"));
  } catch (error) {
    logger.error(error);
    console.log(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}

function sanitizeInput(value) {
  if (typeof value !== "string") return "";
  // Block $ operators to prevent injection
  if (value.includes("$")) return "";
  return value.trim();
}

async function sendPasswordResetEmail(req, res) {
  try {
    //#region handling errors from express-validator ####################################################################################################
    const valRes = validationResult(req);
    const errorMessages = valRes.errors.map((element) => element.msg);
    if (errorMessages.length)
      return res.status(400).json(new ApiError(errorMessages));
    //#endregion handling errors from express-validator #################################################################################################

    // == Extract email from req body ==================================================
    let { email } = req.body;

    // == Find the user with the email ==================================================
    const user = await User.findOne({ email }).lean();
    email = sanitizeInput(email);
    if (!user) return res.status(400).json(new ApiError(["User not found."]));

    // == Check if user is "local" not "mobile" or "google"  ==================================================
    if (user.provider !== "local")
      return res.status(403).json(new ApiError(["Forbidden!"]));

    // == Check if user is verified? ==================================================
    if (!user.isEmailVerified)
      return res
        .status(403)
        .json(new ApiError(["User email is not verified."]));

    // == Check if user is enabled? ==================================================
    if (!user.isEnabled)
      return res.status(403).json(new ApiError(["User is not enabled."]));

    // == Send password reset link ==================================================
    const emailInfo = await sendPasswordVerificationMail(user);
    if (!emailInfo) {
      await PasswordResetTokenModel.findOneAndDelete({
        email: user.email,
      });
      throw new Error("Error occured while sending verification email.");
    }
    console.log(`Password Reset email sent. ID: ${emailInfo.messageId}`);

    // return res.sendStatus(200);
    return res
      .status(200)
      .json(new ApiResponse(null, "Password reset mail sent successfully!"));
  } catch (error) {
    logger.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}

async function resetPassword(req, res) {
  try {
    //#region handling errors from express-validator ####################################################################################################
    const valRes = validationResult(req);
    const errorMessages = valRes.errors.map((element) => element.msg);
    if (errorMessages.length)
      return res.status(400).json(new ApiError(errorMessages));
    //#endregion handling errors from express-validator #################################################################################################

    // == Extracting user and token after authentication ==================================================
    const passwordResetTokenDoc = await PasswordResetTokenModel.findOne({
      token: req.token,
    });

    if (!passwordResetTokenDoc)
      return res
        .status(403)
        .json(new ApiError(["Password reset token not valid. Try again."]));

    const user = await User.findById(req.payload?.userId);
    if (!user) return res.status(404).json(new ApiError(["User not found."]));

    if (passwordResetTokenDoc.email !== user.email)
      return res.status(403).json(new ApiError(["Unauthorized!"]));

    if (!user.isEmailVerified)
      // == Check if user is verified? ==================================================
      return res
        .status(403)
        .json(new ApiError(["User email is not verified."]));

    // == Check if user is enabled? ==================================================
    if (!user.isEnabled)
      return res.status(403).json(new ApiError(["User is not enabled."]));

    // == Extract new password from req body ==================================================
    const { password } = req.body;


    const decryptedPassword = decryptPasswordFromReqBody(
      password,
      process.env.IV,
      process.env.SECRET_KEY_FOR_PASSWORD_DECRYPT
    );
    
    const isPasswordCorrect = await verifyPassword(
      decryptedPassword,
      user.password
    );

    if (isPasswordCorrect)
      return res
        .status(400)
        .json(
          new ApiError(["New password can not be same as current password."])
        );
    // == Encrypt the password ==================================================
    const hashedPassword = await encryptPassword(decryptedPassword);

    // == Update the user doc in the DB ==================================================
    await User.findByIdAndUpdate(
      user.id,
      { password: hashedPassword, accessToken: null, refreshToken: null }, //Removing all the accessTokens also.
      { new: true }
    );

    // == Delete the token record from the DB ==================================================
    await PasswordResetTokenModel.findOneAndDelete({ email: user.email });

    // return res.sendStatus(200);
    return res
      .status(200)
      .json(new ApiResponse(null, "Password reset successfull."));
  } catch (error) {
    logger.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}

async function handleRefreshToken(req, res) {
  //= Extract tokens from req headers ==================================================
  const refreshToken = req?.cookies?.rt;

  //= If any one of them is not found? :send error ==================================================
  if (!refreshToken)
    return res.status(400).json(new ApiError([`Token not found.`]));

  try {
    //= Verify refresh token ==================================================
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    console.log(
      "🚀 ~ file: user.controller.js:325 ~ handleRefreshToken ~ payload:",
      payload
    );

    //= Find the user of the token ==================================================
    let user = await User.findById(payload?.userId);

    //= If payload userId is altered and user not found with the right refersh token & user doesn't have the access token comming in req? :send error ==================================================
    if (!user || !user.accessToken || user.refreshToken !== refreshToken)
      return res.status(403).json(new ApiError([`Forbidden!`]));

    //= Generate a new access token ====================================================================================================
    const newAccessToken = generateToken(
      { userId: user.id },
      { expiresIn: ACCESS_TOKEN_AGE }
    );

    //#region If refresh token is about to expire ====================================================================================================
    // Expiration time in seconds since Unix epoch
    const expirationTimeInSeconds = payload.exp;

    // Current time in seconds since Unix epoch
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    // Set a threshold (e.g., 30 minutes) for considering the token as "about to expire"
    const thresholdInSeconds = 30 * 60;

    // Check if the token is about to expire
    if (expirationTimeInSeconds - currentTimeInSeconds < thresholdInSeconds) {
      console.log("The JWT token is about to expire soon.");

      user.refreshToken = generateToken(
        { userId: user.id },
        { expiresIn: REFRESH_TOKEN_AGE }
      );
    }
    //#endregion If refresh token is about to expire =================================================================================================

    //= Updating accessTokens of the user in the DB ====================================================================================================
    user = await User.findByIdAndUpdate(
      user.id,
      {
        accessToken: newAccessToken,
        refreshToken: user.refreshToken,
      },
      {
        new: true,
      }
    );

    // Update the cookie
    res.cookie("rt", user.refreshToken, COOKIE_OPTIONS);

    return res
      .status(200)
      .json(new ApiResponse({ newAccessToken }, "Token refresh successfull."));
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
    // Check if the user ID is provided
    if (!req.params?.id) {
      return res.status(400).json(new ApiError(["Id not found."]));
    }

    // Check if the file is uploaded
    if (!req.file) {
      return res.status(400).json(new ApiError(["No file uploaded."]));
    }

    // Define the directory and the file path
    const uploadDir = path.join(__dirname, '..','../', 'uploads', 'profilePhotos');
    const filePath = `../../uploads/profilePhotos/${req.file.filename}`;

    // Check if the directory exists, if not, create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Check if the file is saved properly
    const savedFilePath = path.join(uploadDir, req.file.filename);
    // if (!fs.existsSync(savedFilePath)) {
    //   return res.status(500).json(new ApiError(["Failed to save the file."]));
    // }

    // Find the user and update the profilePhoto field
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        profilePhoto: filePath, // Save the file path in the profilePhoto field
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json(new ApiError(["User with given Id not found."]));
    }

    // Return success response with updated user data
    return res.status(200).json(new ApiResponse("Profile photo updated successfully!"));
  } catch (error) {
    logger.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}

async function getProfilePhoto(req, res) {
  try {
    // Check if the user ID is provided
    if (!req.params?.id) {
      return res.status(400).json(new ApiError(["Id not found."]));
    }

    // Find the user by ID
    const user = await User.findById(req.params.id);

    // If no user found, return an error response
    if (!user) {
      return res.status(404).json(new ApiError(["User with given Id not found."]));
    }

    // Check if the profilePhoto field exists
    if (!user.profilePhoto) {
      return res.status(404).json(new ApiError(["Profile photo not found."]));
    }

    // Get the file path from the profilePhoto field (relative path)
    const photoPath = path.join(__dirname, user.profilePhoto); // Resolves to the absolute path of the photo file

    // Send the image file as a response
    return res.sendFile(photoPath); // Sends the image file directly to the client
    // return res.status(404).json(new ApiError(['Test fail']))
  } catch (error) {
    // Log error and return 500 status
    console.error(error);
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
    const photoPath = path.join(__dirname, "../../uploads/visitorsPhotos/" ,visit.image); // Resolves to the absolute path of the photo file

    // Send the image file as a response
    return res.sendFile(photoPath); // Sends the image file directly to the client

  } catch (error) {
    // Log error and return 500 status
    console.error(error);
    return res.status(500).json(new ApiError([error.message]));
  }
}


module.exports = {
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
