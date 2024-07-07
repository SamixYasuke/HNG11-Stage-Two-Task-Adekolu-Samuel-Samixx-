import User from "./User.model.js";
import Organisation from "./Organisation.model.js";
import UserOrganisation from "./UserOrganisation.model.js";
import { sequelizePostgres } from "../configs/database.config.js";

// Set up associations
User.belongsToMany(Organisation, {
  through: UserOrganisation,
  foreignKey: "userId",
});
Organisation.belongsToMany(User, {
  through: UserOrganisation,
  foreignKey: "orgId",
});

const db = {
  User,
  Organisation,
  UserOrganisation,
  sequelizePostgres,
};

export default db;
