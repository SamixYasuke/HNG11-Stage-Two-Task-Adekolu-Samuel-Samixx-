// models/Organisation.js
import { DataTypes } from "sequelize";
import { sequelizePostgres } from "../configs/database.config.js";

const Organisation = sequelizePostgres.define("Organisation", {
  orgId: {
    type: DataTypes.UUID,
    unique: true,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
});

export default Organisation;
