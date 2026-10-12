// middlewares/authorize.js
const { ApiError } = require("../utils/ApiError");

function authorize(requiredRoles = []) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(new ApiError(["User not authenticated."]));
      }

      // Populate role reference if not already populated
      await req.user.populate("role");
      const userRoleName = req.user.role?.name;

      if (!userRoleName) {
        return res.status(403).json(new ApiError(["User role not assigned."]));
      }

      console.log("userRoleName.................................",userRoleName)

      if (!requiredRoles.includes(userRoleName)) {
        return res.status(403).json(new ApiError(["Forbidden: Insufficient role."]));
      }

      next();
    } catch (err) {
      return res.status(500).json(new ApiError([err.message]));
    }
  };
}

module.exports = authorize;
