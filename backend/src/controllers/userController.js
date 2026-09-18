import asyncHandler from "../utils/asyncHandler.js";
import { getUserById, updateUserProfile } from "../services/authService.js";

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update user profile (e.g. name)
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim().length < 2) {
    res.status(400);
    throw new Error("Name must be at least 2 characters long");
  }

  const updatedUser = await updateUserProfile(req.user.id, { name });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});
