import express from "express";
import dotenv from "dotenv";

import authRoute from "./routes/auth.route.js";
import apiRoute from "./routes/api.route.js";
import { startServer } from "./configs/server.config.js";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
dotenv.config();

app.use(cors());
app.use("/auth", authRoute);
app.use("/api", apiRoute);

startServer(port);

export default app;
