import express from "express";
import authoriseUser from "../middlewares/authoriseUser.middleware.js";
import {
  getUserByIdController,
  getAllOrganisationsController,
  getOrganisationByIdController,
  createOrganisationController,
  addUserToOrganisation,
} from "../controllers/api.controller.js";

const router = express.Router();

router.get("/users/:id", authoriseUser, getUserByIdController);

router.get("/organisations", authoriseUser, getAllOrganisationsController);

router.get(
  "/organisations/:orgId",
  authoriseUser,
  getOrganisationByIdController
);

router.post("/organisations", authoriseUser, createOrganisationController);

router.post(
  "/organisations/:orgId/users",
  authoriseUser,
  addUserToOrganisation
);

export default router;
