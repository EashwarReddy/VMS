const { ROLES } = require("../constants");
const RoleModel = require("../models/Role.model");

async function createAdminUser() {
  try {
    const roles = await RoleModel.find();

    if (!roles.length) {
      for (let key in ROLES) {
        if (ROLES.hasOwnProperty(key)) {
          const rolesCreated = await RoleModel.create({ name: ROLES[key] });

          if (!rolesCreated)
            throw new Error(
              "🚫 Error occured while inserting roles in the database."
            );
        }
      }
      console.log("🔆 Roles inserted in the database successfully.");
    }
  } catch (error) {
    console.log("Error: \n", error);
  }
}

module.exports = {
  createAdminUser,
};
