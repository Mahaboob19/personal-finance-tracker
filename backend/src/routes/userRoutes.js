import express from "express";
import { getUserProfile, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Guard all user routes with JWT protection middleware
router.use(protect);

router.route("/me")
  .get(getUserProfile)
  .put(updateProfile);

export default router;
