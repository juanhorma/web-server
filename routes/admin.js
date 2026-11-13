import { Router } from "express";
import * as entriesController from "../controllers/entriesController.js";
import { asyncHandler } from "../asyncHandler.js";
import { requireLogin } from "../middleware/requireLogin.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.get(
  "/entries",
  requireLogin,
  requireAdmin,
  asyncHandler(entriesController.adminIndex),
);

export default router;
