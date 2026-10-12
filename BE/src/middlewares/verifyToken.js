const { ApiError } = require("../utils/ApiError");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const {logger} = require("../configs/logger");

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(400)
        .json(new ApiError([`Authorization header not found.`]));
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer") {
      return res
        .status(403)
        .json(new ApiError([`Wrong authorization header format.`]));
    }

    if (token === "null" || !token)
      return res.status(404).json(new ApiError([`Token not found.`]));

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.token = token;
    req.payload = payload

    next();
  } catch (error) {
    logger.error(error);
    console.log(error);
    return res.status(403).json(new ApiError([error.message]));
  }
}

module.exports = {
  verifyToken,
};
