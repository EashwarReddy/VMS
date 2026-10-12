const { ApiError } = require("../utils/ApiError");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const {logger} = require("../configs/logger");

async function verifyTokenApproveCancel(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(400)
        .json(new ApiError([`Authorization header not found.`]));
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
      return res
        .status(400)
        .json(new ApiError([`Authorization header is malformed.`]));
    }

    const [bearer, token] = parts;
    if (bearer !== "Bearer") {
      return res
        .status(403)
        .json(new ApiError([`Wrong authorization header format.`]));
    }

    if (!token || token === "null" || token === "undefined") {
      return res.status(404).json(new ApiError([`Token not provided.`]));
    }
    console.log("token..........",token)
    let payload;
   
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log("payload..........",payload)
      logger.error("JWT Verification Failed....:", err.message);
      return res.status(403).json(new ApiError([`Invalid or expired token.`]));
    }

    const user = await User.findById(payload?.userId);
    if (!user) {
      return res.status(404).json(new ApiError(["User not found."]));
    }

    if (user.accessToken !== token) {
      return res.status(403).json(new ApiError(["Unauthorized!"]));
    }

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    logger.error(error);
    return res.status(500).json(new ApiError([`Authentication failed.`]));
  }
}


// async function verifyTokenApproveCancel(req, res, next) {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res
//         .status(400)
//         .json(new ApiError([`Authorization header not found.`]));
//     }

//     const parts = authHeader.split(" ");
//     if (parts.length !== 2) {
//       return res
//         .status(400)
//         .json(new ApiError([`Authorization header is malformed.`]));
//     }

//     const [bearer, token] = parts;
//     if (bearer !== "Bearer") {
//       return res
//         .status(403)
//         .json(new ApiError([`Wrong authorization header format.`]));
//     }

//     if (!token || token === "null" || token === "undefined") {
//       return res.status(404).json(new ApiError([`Token not provided.`]));
//     }

//     // 🔑 Verify token
//     let payload;
//     try {
//       payload = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       logger.error("JWT Verification Failed:", err.message);
//       return res.status(403).json(new ApiError([`Invalid or expired token.`]));
//     }

//     // 🔑 Attach payload for raw JWT data
//     req.payload = payload;

//     // 🔑 Get user from DB
//     const user = await User.findById(payload?.userId);
//     if (!user) {
//       return res.status(404).json(new ApiError(["User not found."]));
//     }

//     if (user.accessToken !== token) {
//       return res.status(403).json(new ApiError(["Unauthorized!"]));
//     }

//     // 🔑 Attach user & token
//     req.user = user;
//     req.token = token;

//     next();
//   } catch (error) {
//     logger.error(error);
//     return res.status(500).json(new ApiError([`Authentication failed.`]));
//   }
// }

module.exports = {
  verifyTokenApproveCancel,
};
