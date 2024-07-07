import jwt from "jsonwebtoken";

const generateJwtToken = (newUser) => {
  const accessToken = jwt.sign(
    { userId: newUser.userId, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return accessToken;
};

export default generateJwtToken;
