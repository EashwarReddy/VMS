const { ApiError } = require("../utils/ApiError");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const {logger} = require("../configs/logger");
const Blacklist = require("../models/Blacklist.model");
const Role = require("../models/Role.model");

async function authenticate(req, res, next) {
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
    console.log("token.........",token)

    let payload;
    console.log("process.env.JWT_SECRET............",process.env.JWT_SECRET)
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
      console.log("payload............",payload)
    } catch (err) {
      logger.error("JWT Verification Failed:", err.message);
      return res.status(403).json(new ApiError([`Invalid or expired token.`]));
    }

     // Check blacklist
     const blacklisted = await Blacklist.findOne({ token });
     if (blacklisted) {
      logger.error("Token has been revoked.", { userId: payload?.userId, token, ip: req.ip, url: req.originalUrl });
       return res.status(401).json(new ApiError(["Token has been revoked."]));
     }


    const user = await User.findById(payload?.userId);
    if (!user) {
      return res.status(404).json(new ApiError(["User not found."]));
    }

    if (user.accessToken !== token) {
      return res.status(403).json(new ApiError(["Unauthorized!"]));
    }

     // Additional protection: IP and User-Agent validation


     if (payload.ip !== req.ip)
      return res.status(401).json(new ApiError(["IP mismatch, suspicious request"]));

    // if (payload.ua !== req.headers["user-agent"])
    //   return res.status(401).json(new ApiError(["User-Agent mismatch"]));

    // console.log("payload.sessionId...........",payload.sessionId);
    // console.log("user.currentSessionId.........",user.currentSessionId)
    if (payload.sessionId !== user.currentSessionId){
      logger.error("Session expired or hijacked", { userId: payload?.userId, ip: req.ip, url: req.originalUrl });
      return res.status(401).json(new ApiError(["Session expired or hijacked"]));
    }

    
const role = await Role.findById(user.role).select("name");


    req.token = token;
    req.user = user;

    
req.userContext = {
  userId: user._id,
  roleId: user.role,
  roleName: role?.name || "UNKNOWN",
  email: user.email,
  sessionId: user.currentSessionId
};

    next();
  } catch (error) {
    logger.error(error);
    return res.status(500).json(new ApiError([`Authentication failed.`]));
  }
}

module.exports = {
  authenticate,
};