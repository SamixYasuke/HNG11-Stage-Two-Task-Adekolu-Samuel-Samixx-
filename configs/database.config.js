import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

let sequelizePostgres;

if (process.env.NODE_ENV === "test") {
  sequelizePostgres = new Sequelize(process.env.POSTGRESQL_TEST_URI, {
    dialect: "postgres",
    logging: false,
  });
} else if (process.env.NODE_ENV === "dev") {
  sequelizePostgres = new Sequelize(process.env.POSTGRESQL_TEST_DEV, {
    dialect: "postgres",
    logging: false,
  });
} else {
  sequelizePostgres = new Sequelize(process.env.POSTGRESQL_URI, {
    dialect: "postgres",
    logging: false,
  });
}

async function connectToDatabase() {
  try {
    await sequelizePostgres.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.log("Unable to connect to the database:", error);
  }
}

async function closeDatabaseConnection() {
  try {
    await sequelizePostgres.close();
    console.log("Database connection closed successfully.");
  } catch (error) {
    console.log("Unable to close the database connection:", error);
  }
}

connectToDatabase();

export { sequelizePostgres, connectToDatabase, closeDatabaseConnection };
