import { Router } from "express";
import * as entriesController from "../controllers/entriesController.js";
import { requireLogin } from "../middleware/requireLogin.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(entriesController.index));
router.post("/", requireLogin, asyncHandler(entriesController.create));
router.post(
  "/classic",
  requireLogin,
  asyncHandler(entriesController.createClassic),
);
router.get("/:id", asyncHandler(entriesController.show));
router.get("/:id/edit", requireLogin, asyncHandler(entriesController.edit));
router.put("/:id", requireLogin, asyncHandler(entriesController.update));
router.patch(
  "/:id/favorite",
  requireLogin,
  asyncHandler(entriesController.toggleFavorite),
);
router.delete("/:id", requireLogin, asyncHandler(entriesController.destroy));

export default router;
