import * as entriesService from "../services/entriesService.js";
import { isValidId } from "../repositories/entriesRepository.js";

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const index = async (req, res) => {
  const entries = await entriesService.listEntries();
  res.set("Total-Count", entries.length);
  res.status(200).render("entries", { entries });
};

export const create = async (req, res) => {
  const result = await entriesService.createEntry(req.body);
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.status(201).json(result.value);
};

export const update = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400).json({ error: "id must be a valid id" });
    return;
  }
  const result = await entriesService.updateEntry(id, req.body);
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(200).json(result.value);
};

export const remove = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400).json({ error: "id must be a valid id" });
    return;
  }

  const updatedEntries = await entriesService.deleteEntry(id);

  if (!updatedEntries.ok) {
    res.status(404).json({ error: updatedEntries.error });
    return;
  }
  // await delay(1000);

  res.status(200).send("");
};

export const patch = async (req, res) => {
  const { id } = req.params;
  if (!isValid(id)) {
    res.status(400).json({ error: "id must be a valid id" });
    return;
  }

  const result = await entriesService.patchEntry(id);
  if (!result.ok) {
    res.status(404).json({ error: result.error });
  }

  res.status(202);
};
