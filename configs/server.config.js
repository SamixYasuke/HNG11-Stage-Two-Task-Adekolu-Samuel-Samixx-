import db from "../models/Index.model.js";
import app from "../app.js";
let server;

const startServer = async (port) => {
  try {
    await db.sequelizePostgres.sync();
    server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.log("Unable to connect to the database:", err);
  }
};

const stopServer = async () => {
  if (server) {
    server.close();
  }
};

export { startServer, stopServer };
