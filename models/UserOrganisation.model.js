import { DataTypes } from "sequelize";
import { sequelizePostgres } from "../configs/database.config.js";
import Organisation from "./Organisation.model.js";
import User from "./User.model.js";

const UserOrganisation = sequelizePostgres.define("UserOrganisation", {
  id: {
    type: DataTypes.UUID,
    unique: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: "userId",
    },
  },
  orgId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Organisation,
      key: "orgId",
    },
  },
});

export default UserOrganisation;
