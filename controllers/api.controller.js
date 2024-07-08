import { v4 as uuidv4, validate as validateUUID } from "uuid";
import db from "../models/Index.model.js";

const isValidUUID = (id) => validateUUID(id);

const getUserByIdController = async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid user ID format",
    });
  }

  try {
    const requestedUser = await db.User.findByPk(id);

    if (!requestedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (req.userId === requestedUser.userId) {
      return res.status(200).json({
        status: "success",
        message: "User details retrieved successfully",
        data: {
          userId: requestedUser.userId,
          firstName: requestedUser.firstName,
          lastName: requestedUser.lastName,
          email: requestedUser.email,
          phone: requestedUser.phone,
        },
      });
    }

    const authenticatedUser = await db.User.findByPk(req.userId);
    const requestedUserOrgDetails = await db.UserOrganisation.findOne({
      where: { userId: requestedUser.userId },
    });
    const authenticatedUserOrgDetails = await db.UserOrganisation.findOne({
      where: { userId: authenticatedUser.userId },
    });

    if (requestedUserOrgDetails.orgId === authenticatedUserOrgDetails.orgId) {
      return res.status(200).json({
        status: "success",
        message: "Users belong to the same organisation",
        data: {
          userId: requestedUser.userId,
          firstName: requestedUser.firstName,
          lastName: requestedUser.lastName,
          email: requestedUser.email,
          phone: requestedUser.phone,
        },
      });
    } else {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: You do not have access to this user's details",
      });
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const getAllOrganisationsController = async (req, res) => {
  const authenticatedUserId = req.userId;

  if (!isValidUUID(authenticatedUserId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid user ID format",
    });
  }

  try {
    const authenticatedUser = await db.User.findByPk(authenticatedUserId);

    if (!authenticatedUser) {
      return res.status(404).json({
        status: "error",
        message: "Authenticated user not found",
      });
    }

    const organisations = await db.UserOrganisation.findAll({
      where: { userId: authenticatedUser.userId },
    });

    const organisationsId = organisations.map(
      (organisation) => organisation.orgId
    );

    const organisationsData = await db.Organisation.findAll({
      attributes: ["orgId", "name", "description"],
      where: { orgId: organisationsId },
    });

    res.status(200).json({
      status: "success",
      message: "Organisations fetched successfully",
      data: {
        organisations: organisationsData,
      },
    });
  } catch (error) {
    console.error("Error fetching organisations:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const getOrganisationByIdController = async (req, res) => {
  const authenticatedUserId = req.userId;
  const { orgId } = req.params;

  if (!isValidUUID(authenticatedUserId) || !isValidUUID(orgId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  try {
    const authenticatedUser = await db.User.findByPk(authenticatedUserId);

    if (!authenticatedUser) {
      return res.status(404).json({
        status: "error",
        message: "Authenticated user not found",
      });
    }

    const organisation = await db.Organisation.findByPk(orgId);

    if (!organisation) {
      return res.status(404).json({
        status: "error",
        message: "Organisation not found",
      });
    }

    const userOrganisation = await db.UserOrganisation.findOne({
      where: {
        userId: authenticatedUser.userId,
        orgId: organisation.orgId,
      },
    });

    if (!userOrganisation) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: You do not have access to this organisation",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Organisation details fetched successfully",
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (error) {
    console.error("Error fetching organisation details:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};


const createOrganisationController = async (req, res) => {
  const { name, description } = req.body;
  const authenticatedUserId = req.userId;

  if (!isValidUUID(authenticatedUserId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid user ID format",
    });
  }

  try {
    if (!name) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Client Error",
        statusCode: 400,
      });
    }

    const authenticatedUserDetails = await db.User.findByPk(authenticatedUserId);

    const orgData = { name, description };
    const newOrg = await db.Organisation.create(orgData);

    const userOrgData = {
      userId: authenticatedUserDetails.userId,
      orgId: newOrg.orgId,
    };

    await db.UserOrganisation.create(userOrgData);

    res.status(201).json({
      status: "success",
      message: "Organisation created successfully",
      data: {
        orgId: newOrg.orgId,
        name: newOrg.name,
        description: newOrg.description,
      },
    });
  } catch (error) {
    console.error("Error creating organisation:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};


const addUserToOrganisation = async (req, res) => {
  const { orgId } = req.params;
  const { userId } = req.body;
  const authenticatedUserId = req.userId;

  if (
    !isValidUUID(authenticatedUserId) ||
    !isValidUUID(orgId) ||
    !isValidUUID(userId)
  ) {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  try {
    const authenticatedUser = await db.User.findByPk(authenticatedUserId);

    if (!userId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Client error",
        statusCode: 400,
      });
    }

    if (!authenticatedUser) {
      return res.status(404).json({
        status: "error",
        message: "Authenticated user not found",
      });
    }

    const organisation = await db.Organisation.findByPk(orgId);

    if (!organisation) {
      return res.status(404).json({
        status: "error",
        message: "Organisation not found",
      });
    }

    const userOrganisation = await db.UserOrganisation.findOne({
      where: {
        userId: authenticatedUser.userId,
        orgId: organisation.orgId,
      },
    });

    if (!userOrganisation) {
      return res.status(403).json({
        status: "error",
        message:
          "Forbidden: You do not have access to add users to this organisation",
      });
    }

    const userToBeAdded = await db.User.findByPk(userId);

    if (!userToBeAdded) {
      return res.status(404).json({
        status: "error",
        message: "User to be added not found",
      });
    }

    const existingUserOrganisation = await db.UserOrganisation.findOne({
      where: {
        userId: userToBeAdded.userId,
        orgId: organisation.orgId,
      },
    });

    if (existingUserOrganisation) {
      return res.status(400).json({
        status: "error",
        message: "User is already part of the organisation",
      });
    }

    await db.UserOrganisation.create({
      userId: userToBeAdded.userId,
      orgId: organisation.orgId,
    });

    res.status(200).json({
      status: "success",
      message: "User added to organisation successfully",
    });
  } catch (error) {
    console.error("Error adding user to organisation:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export {
  getUserByIdController,
  getAllOrganisationsController,
  getOrganisationByIdController,
  createOrganisationController,
  addUserToOrganisation,
};
