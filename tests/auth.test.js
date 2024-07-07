import app from "../app.js";
import supertest from "supertest";
import jwt from "jsonwebtoken";
import generateJwtToken from "../utilities/tokengenerator.utility.js";
import {
  closeDatabaseConnection,
  connectToDatabase,
} from "../configs/database.config.js";
import dotenv from "dotenv";
import db from "../models/Index.model.js";

dotenv.config();

const request = supertest(app);

process.env.NODE_ENV = "test";

// UNIT TEST ONE(1)
/////
/////
/////
////
describe("Token generation - Unit Test", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  test("should generate a token with correct user details and the token should expire at the correct time", () => {
    const user = {
      userId: "somerandomid",
      email: "userdjddjdjjdjd@example.com",
    };
    const token = generateJwtToken(user);
    const decoded = jwt.decode(token);
    expect(decoded.userId).toBe(user.userId);
    expect(decoded.email).toBe(user.email);
    const getTheCurrentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;

    // Allow a margin of error in the expiration time check
    const margin = 5;
    expect(expirationTime).toBeGreaterThan(getTheCurrentTime + 3600 - margin);
    expect(expirationTime).toBeLessThan(getTheCurrentTime + 3600 + margin);
  });

  test("The correct user detail should be found in the generated token", () => {
    const user = {
      userId: "123",
      email: "usndndddkdkdddjdjer@example.com",
    };
    const token = generateJwtToken(user);
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      expect(err).toBeNull();
      expect(decoded.userId).toBe(user.userId);
      expect(decoded.email).toBe(user.email);
    });
  });
});

// UNIT TEST TWO(2)
////
////
////
////
////
describe("Organisations Unit Test - Ensure users can’t see data from organisations they didn't create or belong to", () => {
  let token1, token2, orgId1, orgId2;

  beforeAll(async () => {
    await connectToDatabase();
  });

  test("should allow access to organisations created by the same user", async () => {
    const registerResponse1 = await request.post("/auth/register").send({
      firstName: "user1",
      lastName: "user1lastname",
      email: "user1@gmail.com",
      password: "user1password",
    });

    expect(registerResponse1.status).toBe(201);
    expect(registerResponse1.body.status).toBe("success");
    expect(registerResponse1.body.data.accessToken).toBeDefined();
    token1 = registerResponse1.body.data.accessToken;

    const createOrgResponse1 = await request
      .post("/api/organisations")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        name: "new Org for User one(1)",
        description: "Description for user one(1)",
      });
    expect(createOrgResponse1.status).toBe(201);
    expect(createOrgResponse1.body.newOrg).toBeDefined();
    orgId1 = createOrgResponse1.body.newOrg.orgId;

    // User 1 tries to access Org 1 created by User 1
    const accessOrgResponse1 = await request
      .get(`/api/organisations/${orgId1}`)
      .set("Authorization", `Bearer ${token1}`);
    expect(accessOrgResponse1.status).toBe(200);
  });

  test("should deny access to organisations created by other users", async () => {
    const registerResponse2 = await request.post("/auth/register").send({
      firstName: "user2",
      lastName: "user2lastname",
      email: "user2@gmail.com",
      password: "user2password",
      phone: "387466736767",
    });

    expect(registerResponse2.status).toBe(201);
    expect(registerResponse2.body.status).toBe("success");
    expect(registerResponse2.body.data.accessToken).toBeDefined();
    token2 = registerResponse2.body.data.accessToken;

    // User 2 creates an organization
    const createOrgResponse2 = await request
      .post("/api/organisations")
      .set("Authorization", `Bearer ${token2}`)
      .send({
        name: "Org 2 by User 2",
        description: "Description for Org 2 by User 2",
      });

    expect(createOrgResponse2.status).toBe(201);
    expect(createOrgResponse2.body.newOrg).toBeDefined();
    orgId2 = createOrgResponse2.body.newOrg.orgId;

    // User 1 tries to access Org 2 created by User 2
    const accessOrgResponse2 = await request
      .get(`/api/organisations/${orgId2}`)
      .set("Authorization", `Bearer ${token1}`);
    expect(accessOrgResponse2.status).toBe(403);
  });
});

// END TO END TEST [POST]/auth/register
/////
/////
/////
/////
/////
describe("POST /auth/register - End-to-End Tests", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    await db.User.destroy({ where: {} });
    await closeDatabaseConnection();
  });

  test("should successfully register a user", async () => {
    const response = await request.post("/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      password: "password123",
    });
    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("accessToken");
  });

  test("should verify the default organisation name is correctly generated", async () => {
    const response = await request.post("/auth/register").send({
      firstName: "Samuel",
      lastName: "Doe",
      email: "samueldoe@example.com",
      password: "password123",
    });
    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("accessToken");
    const accessToken = response.body.data.accessToken;
    // Verify that the organisation is correctly created
    const orgResponse = await request
      .get("/api/organisations")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(orgResponse.status).toBe(200);
    expect(orgResponse.body.status).toBe("success");
    expect(orgResponse.body.data).toHaveProperty("organisations");
    expect(orgResponse.body.data.organisations.length).toBeGreaterThan(0);
    const organisation = orgResponse.body.data.organisations[0];
    expect(organisation).toHaveProperty("orgId");
    expect(organisation).toHaveProperty("name", "Samuel's Organisation");
    expect(organisation).toHaveProperty("description");
  });

  test("should return validation error for missing fields - firstName", async () => {
    const response = await request.post("/auth/register").send({
      // first name is missing
      lastName: "Doe",
      email: "johndoe@example.com",
      password: "password123",
    });
    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "firstName",
          message: "First name is required",
        }),
      ])
    );
  });

  test("should return validation error for missing fields - last name", async () => {
    const response = await request.post("/auth/register").send({
      firstName: "Doe",
      // last name is missing
      email: "johndoe@example.com",
      password: "password123",
    });
    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "lastName",
          message: "Last name is required",
        }),
      ])
    );
  });

  test("should return validation error for missing fields - email", async () => {
    const response = await request.post("/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      // email is missing
      password: "password123",
    });
    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "email",
          message: "Email is required",
        }),
      ])
    );
  });

  test("should return validation error for missing fields - password", async () => {
    const response = await request.post("/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      // password is missing
    });
    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "password",
          message: "Password is required",
        }),
      ])
    );
  });

  test("It Should Fail if there’s Duplicate Email", async () => {
    await request.post("/auth/register").send({
      firstName: "Samixx one",
      lastName: "Yasuke One",
      email: "samixx@example.com",
      password: "samixx_password",
    });

    const userTwo = await request.post("/auth/register").send({
      firstName: "Samixx Two",
      lastName: "Yasuke Two",
      email: "samixx@example.com",
      password: "samixx_password",
    });
    expect(userTwo.status).toBe(422);
    expect(userTwo.body.errors[0].message);
  });
});
