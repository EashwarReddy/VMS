const logger = require("../configs/logger");
const { ApiError } = require("../utils/ApiError");

async function checkRefreshTokenCookie(req, res, next) {
  try {
    console.log("req.cookies.rt: ", req.cookies.rt);
    if (!req?.cookies)
      return res.status(401).json(new ApiError(["Cookies not found."]));

    next();
  } catch (error) {
    logger.error(error);
    console.log(error);
    return res
      .status(403)
      .json(new ApiError(["Something went wrong at server-side."]));
  }
}

module.exports = {
  checkRefreshTokenCookie,
};
