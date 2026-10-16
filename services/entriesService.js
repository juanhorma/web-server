import {
  getAll,
  findById,
  create,
  updateById,
  removeById,
} from "../repositories/entriesRepository.js";
import { toEntryDto } from "../dtos/entryDto.js";
import { Ok, Err, Some, None } from "../result.js";

export const findEntryById = (entries, id) => {
  const entry = entries.find((entry) => entry.id === id);
  return entry ? Some(entry) : None;
};

export const validateEntry = ({ title, body }) => {
  if (!title || !body) return Err("title and body are required");
  if (title.length > 60) return Err("title must be at most 60 characters");
  const trimmedTitle = title.trimEnd();
  const trimmedBody = body.trimEnd();

  if (trimmedTitle.length == 0) return Err("title must be non-empty");
  if (trimmedBody.length == 0) return Err("body must be non-empty");

  return Ok({ title: trimmedTitle, body: trimmedBody });
};

export const validateId = (id) => {
  if (typeof id !== "number") return Err("id must be a number");
  if (!Number.isInteger(id)) return Err("id must be a whole number");
  return Ok(id);
};

export const listEntries = async () => (await getAll()).map(toEntryDto);

export const createEntry = async (data) => {
  const result = validateEntry(data);

  if (!result.ok) {
    return result;
  }
  return Ok(toEntryDto(await create(result.value)));
};

export const updateEntry = async (id, data) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Entry not found" });

  const result = validateEntry(data);
  if (!result.ok) return result;

  return Ok(toEntryDto(await updateById(id, result.value)));
};

export const deleteEntry = async (id) => {
  const existing = await findById(id);
  if (!existing) return Err("entry not found");
  await removeById(id);
  return Ok(null);
};

export const patchEntry = async (id) => {
  const existing = await findById(id);
  if (!existing) return Err("Entry not found");

  const newVal = !existing.favorite;
  await patchById(id, newVal);
  return Ok(null);
};
