// models/User.js
import { DataTypes } from "sequelize";
import { sequelizePostgres } from "../configs/database.config.js";

const User = sequelizePostgres.define("User", {
  userId: {
    type: DataTypes.UUID,
    unique: true,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
});

export default User;
