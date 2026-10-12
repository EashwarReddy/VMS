const Role = require("../models/Role.model");
const { ROLES } = require("../constants");
const logger = require("../configs/logger");

async function getUserRoleId() {
  try {
    const roles = await Role.find();
    const userRole = roles.filter((role) => role.name === ROLES.visitor);
    if (!userRole.length) throw new Error("No roles found in the database.");

    return userRole[0].id;
  } catch (error) {
    logger.error(error.message);
    return;
  }
}

module.exports = getUserRoleId;
