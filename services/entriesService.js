import { Ok, Err } from "../result.js";
import {
  getAll,
  findById,
  create,
  updateById,
  removeById,
} from "../repositories/entriesRepository.js";
import { toEntryDto, toEntryView, toAdminEntryDto } from "../dtos/entryDto.js";
import * as usersRepository from "../repositories/usersRepository.js";

const validateEntry = ({ title, body }) => {
  const trimmedTitle = (title || "").trim();
  const trimmedBody = (body || "").trim();
  if (!trimmedTitle || !trimmedBody)
    return Err({ status: 400, message: "title and body are required" });
  return Ok({ title: trimmedTitle, body: trimmedBody });
};

const isOwnerOrAdmin = async (entry, actorId) => {
  if (entry.ownerId.toString() === actorId) return true;
  const account = await usersRepository.findById(actorId);
  return account?.role === "admin";
};

// Whether the actor is an admin. attachUser already put the role on req.user;
// a caller without it (a test, say) gets it looked up.
const isAdmin = async (actor) => {
  if (!actor) return false;
  if (actor.role) return actor.role === "admin";
  return (await usersRepository.findById(actor.id))?.role === "admin";
};

const canChange = (entry, actor, admin) =>
  Boolean(actor) && (admin || entry.ownerId?.toString() === actor.id);

// The page's view of the list: each entry with canChange for this actor
// (false for everyone when logged out). Hiding a button is not authorization:
// updateEntry and deleteEntry below still answer 403 on their own.
export const listEntriesForPage = async (actor) => {
  const admin = await isAdmin(actor);
  return (await getAll())
    .map((entry) => toEntryView(entry, canChange(entry, actor, admin)))
    .sort((a, b) => a.title.localeCompare(b.title));
};

// One entry as the page shows it, for the partials htmx swaps in.
export const getEntryForPage = async (id, actor) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Entry not found" });
  return Ok(
    toEntryView(existing, canChange(existing, actor, await isAdmin(actor))),
  );
};

export const listEntries = async () =>
  (await getAll())
    .map(toEntryDto)
    .sort((a, b) => a.title.localeCompare(b.title));

export const getEntry = async (id) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Entry not found" });
  return Ok(toEntryDto(existing));
};

export const listEntriesForAdmin = async () =>
  (await getAll())
    .map(toAdminEntryDto)
    .sort((a, b) => a.title.localeCompare(b.title));

export const getEntryForEdit = async (id, actor) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Entry not found" });
  if (!(await isOwnerOrAdmin(existing, actor.id))) {
    return Err({
      status: 403,
      message: "You do not have permission to modify this entry",
    });
  }
  return Ok(toEntryDto(existing));
};

export const createEntry = async (data, actor) => {
  const result = validateEntry(data);
  if (!result.ok) return result;
  return Ok(toEntryDto(await create({ ...result.value, ownerId: actor.id })));
};

export const updateEntry = async (id, data, actor) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Entry not found" });
  if (!(await isOwnerOrAdmin(existing, actor.id))) {
    return Err({
      status: 403,
      message: "You do not have permission to modify this entry",
    });
  }

  const result = validateEntry(data);
  if (!result.ok) return result;
  return Ok(toEntryDto(await updateById(id, result.value)));
};

export const deleteEntry = async (id, actor) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Entry not found" });
  if (!(await isOwnerOrAdmin(existing, actor.id))) {
    return Err({
      status: 403,
      message: "You do not have permission to delete this entry",
    });
  }
  await removeById(id);
  return Ok(null);
};

export const toggleFavorite = async (id, actor) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Entry not found" });
  if (!(await isOwnerOrAdmin(existing, actor.id))) {
    return Err({
      status: 403,
      message: "you do not have permission to delete this entry",
    });
  }
  return Ok(toEntryDto(await updateById(id, { favorite: !existing.favorite })));
};
