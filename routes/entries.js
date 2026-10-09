import { Router } from "express";
import { readFile, writeFile } from "node:fs/promises";
import { Ok, Err, Some, None } from "../result.js";

const router = Router();
const DATA_FILE = "entries.json";

const validateEntry = ({ title, body }) => {
  if (!title || !body) return Err("title and body are required");
  if (title.length > 80) return Err("title must be at most 80 characters");
  return Ok({ title, body });
};
const validateId = (id) => {
  if (typeof id !== "number") return Err("id must be a number");
  if (!Number.isInteger(id)) return Err("id must be a whole number");
  return Ok(id);
};

const findEntryById = (entries, id) => {
  const entry = entries.find((entry) => entry.id === id);
  return entry ? Some(entry) : None;
};

const asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await readFile(DATA_FILE, "utf-8");
    const my_entries = JSON.parse(data);
    res.set("Total-Count", my_entries.length);
    res.status(200).render("entries", { entries: my_entries });
  }),
);

router.get(
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
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const result = validateEntry(req.body);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    const data = await readFile(DATA_FILE, "utf-8");
    const my_entries = JSON.parse(data);
    const new_id = my_entries.at(-1).id + 1;
    const { title, body } = result.value;
    const new_entry = { id: new_id, title, body };
    my_entries.push(new_entry);
    await writeFile(DATA_FILE, JSON.stringify(my_entries), "utf8");
    // res.status(201).json(new_entry);
    res.status(201).json(new_entry);
  }),
);

router.post(
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
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const validatedId = validateId(id);
    if (!validatedId.ok) {
      res.status(400).json({ error: validatedId.error });
      return;
    }

    const data = await readFile(DATA_FILE, "utf-8");
    const entries = JSON.parse(data);

    const found = findEntryById(entries, validatedId.value);
    if (!found.some) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }

    const result = validateEntry(req.body);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }

    const updatedEntry = { id: found.value.id, ...result.value };
    const index = entries.indexOf(found.value);
    entries[index] = updatedEntry;
    await writeFile(DATA_FILE, JSON.stringify(entries, null, 2));
    res.status(200).json(updatedEntry);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const data = await readFile(DATA_FILE, "utf-8");
    const my_entries = JSON.parse(data);
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

    my_entries.splice(my_entries.indexOf(found.value), 1);
    await writeFile(DATA_FILE, JSON.stringify(my_entries), "utf8");
    res.set("Total-Count", my_entries.length);

    res.status(202).json(my_entries);
  }),
);

export default router;
