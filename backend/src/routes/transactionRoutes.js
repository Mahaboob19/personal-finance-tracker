import express from "express";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All transaction routes are strictly protected
router.use(protect);

router.route("/")
  .get(getAll)
  .post(create);

router.route("/:id")
  .get(getOne)
  .put(update)
  .delete(remove);

export default router;
