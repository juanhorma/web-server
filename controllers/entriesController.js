import * as entriesService from "../services/entriesService.js";
import { isValidId } from "../repositories/entriesRepository.js";

// htmx marks every request it sends with an HX-Request header. Those get a
// piece of HTML to swap into the page; anything else (curl, a test, another
// program) still gets JSON, the same as before.
const fromHtmx = (req) => req.get("HX-Request") === "true";

// htmx swaps an error answer into the page's status line (see the
// htmx-config meta tag in views/entries.ejs), so it gets plain text.
const sendError = (req, res, { status, message }) => {
  if (fromHtmx(req)) {
    res.status(status).send(message);
    return;
  }
  res.status(status).json({ error: message });
};

const badId = (req, res) =>
  sendError(req, res, { status: 400, message: "id must be a valid id" });

export const index = async (req, res) => {
  const entries = await entriesService.listEntries();
  res.set("X-Total-Count", entries.length);
  res.status(200).render("entries", { title: "My Notes", entries });
};

export const show = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return badId(req, res);
  const result = await entriesService.getEntry(id);
  if (!result.ok) return sendError(req, res, result.error);
  if (fromHtmx(req)) {
    res.status(200).render("partials/entry", { entry: result.value });
    return;
  }
  res.status(200).json(result.value);
};

export const edit = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return badId(req, res);
  const result = await entriesService.getEntry(id);
  if (!result.ok) return sendError(req, res, result.error);
  res.status(200).render("partials/entry-edit", { entry: result.value });
};

export const create = async (req, res) => {
  const result = await entriesService.createEntry(req.body);
  if (!result.ok) return sendError(req, res, result.error);
  if (fromHtmx(req)) {
    res.status(201).render("partials/entry-created", { entry: result.value });
    return;
  }
  res.status(201).json(result.value);
};

export const createClassic = async (req, res) => {
  const result = await entriesService.createEntry(req.body);
  if (!result.ok) {
    res.status(result.error.status).send(result.error.message);
    return;
  }
  res.redirect("/entries");
};

export const update = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return badId(req, res);
  const result = await entriesService.updateEntry(id, req.body);
  if (!result.ok) return sendError(req, res, result.error);
  if (fromHtmx(req)) {
    res.status(200).render("partials/entry-saved", { entry: result.value });
    return;
  }
  res.status(200).json(result.value);
};

export const toggleFavorite = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return badId(req, res);
  const result = await entriesService.toggleFavorite(id);
  if (!result.ok) return sendError(req, res, result.error);
  if (fromHtmx(req)) {
    res.status(200).render("partials/entry", { entry: result.value });
    return;
  }
  res.status(200).json(result.value);
};

export const destroy = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return badId(req, res);
  const result = await entriesService.deleteEntry(id);
  if (!result.ok) return sendError(req, res, result.error);
  if (fromHtmx(req)) {
    res.status(200).render("partials/entry-deleted");
    return;
  }
  res.status(200).send("");
};
