import express from "express";
import {
  getSummaryController,
  getMonthlyController,
  getCategoriesController,
  getTrendsController,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All analytics endpoints require valid JWT authentication
router.use(protect);

router.get("/summary", getSummaryController);
router.get("/monthly", getMonthlyController);
router.get("/categories", getCategoriesController);
router.get("/trends", getTrendsController);

export default router;
