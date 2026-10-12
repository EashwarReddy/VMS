const Role = require("../models/Role.model");
const { ROLES } = require("../constants");
const logger = require("../configs/logger");

async function createRolesInDB() {
  try {
    const roles = await Role.find();

    if (!roles.length) {
      for (let key in ROLES) {
        if (ROLES.hasOwnProperty(key)) {
          const roleCreated = await Role.create({ name: ROLES[key] });

          if (!roleCreated)
            throw new Error(
              "🚫 Error occured while creating role in the database."
            );
        }
      }
      console.log("🔆 Roles created in the database successfully.");
    }
  } catch (error) {
    console.log("Error: ", error);
    logger.error(error);
  }
}

module.exports = {
  createRolesInDB,
};
