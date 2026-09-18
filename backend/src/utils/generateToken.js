import jwt from "jsonwebtoken";

/**
 * Signs a JWT with the user's MongoDB ObjectId as the subject payload.
 * Valid for 7 days.
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export default generateToken;