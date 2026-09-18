import bcrypt from "bcrypt";

/**
 * Hashes a plaintext password using bcrypt with a salt cost factor of 10.
 */
export const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

/**
 * Compares a candidate plaintext password against an encrypted hash.
 */
export const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};