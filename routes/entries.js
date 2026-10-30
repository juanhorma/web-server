import { Router } from "express";
import * as entriesController from "../controllers/entriesController.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(entriesController.index));
router.post("/", asyncHandler(entriesController.create));
router.post("/classic", asyncHandler(entriesController.createClassic));
router.get("/:id", asyncHandler(entriesController.show));
router.get("/:id/edit", asyncHandler(entriesController.edit));
router.put("/:id", asyncHandler(entriesController.update));
router.patch("/:id/favorite", asyncHandler(entriesController.toggleFavorite));
router.delete("/:id", asyncHandler(entriesController.destroy));

export default router;
