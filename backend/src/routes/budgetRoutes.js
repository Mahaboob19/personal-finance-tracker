import express from "express";
import {
  create,
  getAll,
  update,
  remove,
} from "../controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Guard all budget routes with JWT authentication
router.use(protect);

router.route("/")
  .get(getAll)
  .post(create);

router.route("/:id")
  .put(update)
  .delete(remove);

export default router;
