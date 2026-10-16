import { Router } from "express";
import * as entriesController from "../controllers/entriesController.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();
const DATA_FILE = "entries.json";

router.get("/", asyncHandler(entriesController.index));

router.post("/", asyncHandler(entriesController.create));

router.put("/:id", asyncHandler(entriesController.update));

router.delete("/:id", asyncHandler(entriesController.remove));

router.patch("/:id/favorite", asyncHandler(entriesController.patch));

/* router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await readFile(DATA_FILE, "utf-8");
    const my_entries = JSON.parse(data);
    const id = Number(req.params.id);
    const validatedId = validateId(id);
    if (!validatedId.ok) {
      res.status(400).json({ error: validatedId.error });
      return;
    }

    const found = findEntryById(my_entries, validatedId.value);
    if (!found.some) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }

    const my_entry = [found.value];

    res.status(200).render("entries", { title: "My notes", entries: my_entry });
  }),
); */

/* router.post(
  "/classic",
  asyncHandler(async (req, res) => {
    const result = validateEntry(req.body);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }

    const data = await readFile(DATA_FILE, "utf-8");
    const entries = JSON.parse(data);
    const new_id = entries.at(-1).id + 1;
    const { title, body } = result.value;
    entries.push({ id: new_id, title, body });
    await writeFile(DATA_FILE, JSON.stringify(entries, null, 2));

    res.redirect("/entries");
  }),
); */

export default router;
