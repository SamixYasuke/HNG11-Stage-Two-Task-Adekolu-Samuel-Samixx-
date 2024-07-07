import db from "../models/Index.model.js";
import bcrypt from "bcrypt";
import generateJwtToken from "../utilities/tokengenerator.utility.js";
import validateEmail from "../utilities/validatemail.utility.js";

const registerController = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    if (!firstName) {
      return res.status(422).json({
        errors: [{ field: "firstName", message: "First name is required" }],
      });
    }

    if (!lastName) {
      return res.status(422).json({
        errors: [{ field: "lastName", message: "Last name is required" }],
      });
    }

    if (!email) {
      return res.status(422).json({
        errors: [{ field: "email", message: "Email is required" }],
      });
    }

    if (!password) {
      return res.status(422).json({
        errors: [{ field: "password", message: "Password is required" }],
      });
    }

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(422).json({
        errors: [{ field: "email", message: "Email already exists" }],
      });
    }

    const emailIsValid = validateEmail(email);
    if (!emailIsValid) {
      return res.status(422).json({
        errors: [{ field: "email", message: "Email is invalid!!" }],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    };

    const newUser = await db.User.create(userData);
    console.log("User saved successfully:", newUser);

    const orgData = {
      name: `${firstName}'s Organisation`,
      description: `Organisation for ${firstName} ${lastName}`,
    };

    const newOrganisation = await db.Organisation.create(orgData);
    console.log("Organisation saved successfully:", newOrganisation);

    console.log({
      id: `${newUser.userId}${newOrganisation.orgId}`,
      userId: newUser.userId,
      orgId: newOrganisation.orgId,
    });
    const newUserOrganisation = await db.UserOrganisation.create({
      userId: newUser.userId,
      orgId: newOrganisation.orgId,
    });

    console.log("newUserOrganisation saved successfully:", newUserOrganisation);
    const jwtToken = generateJwtToken(newUser);

    res.status(201).json({
      status: "success",
      message: "Registration successful",
      data: {
        accessToken: jwtToken,
        user: {
          userId: newUser.userId,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({
      status: "Bad request",
      message: "Registration unsuccessful",
      statusCode: 400,
    });
  }
};

const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user with provided email exists
    const existingUser = await db.User.findOne({ where: { email } });

    if (!existingUser) {
      return res.status(404).json({
        status: "error",
        message: `User with email address ${email} not found`,
      });
    }

    // Verify password
    const passwordIsCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!passwordIsCorrect) {
      return res.status(400).json({
        status: "error",
        message: "Invalid password",
      });
    }

    // Generate access token
    const jwtToken = generateJwtToken(existingUser);

    // Return successful login response
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        accessToken: jwtToken,
        user: {
          userId: existingUser.userId,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          phone: existingUser.phone,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export { registerController, loginController };
