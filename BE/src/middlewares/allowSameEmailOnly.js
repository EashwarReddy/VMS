// middlewares/allowSameEmailOnly.js
const { ApiError } = require("../utils/ApiError");

function allowSameEmailOnly() {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json(new ApiError(["User not authenticated."]));
      }

      const userEmail = req.user.email;
      const requestedEmail = req.params.email || req.query.email;

      if (!requestedEmail) {
        return res
          .status(400)
          .json(new ApiError(["Email parameter is required."]));
      }

      if (!userEmail) {
        return res
          .status(403)
          .json(new ApiError(["User email not found."]));
      }

      if (userEmail !== requestedEmail) {
        return res
          .status(403)
          .json(new ApiError(["Forbidden: Access denied."]));
      }

      next();
    } catch (err) {
      return res
        .status(500)
        .json(new ApiError([err.message]));
    }
  };
}

module.exports = allowSameEmailOnly;
