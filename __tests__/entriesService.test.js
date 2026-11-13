import { jest } from "@jest/globals";

jest.unstable_mockModule("../repositories/entriesRepository.js", () => ({
  isValidId: jest.fn(() => true),
  getAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn((data) => ({ _id: "fake-id", ...data })),
  updateById: jest.fn(),
  removeById: jest.fn(),
}));

jest.unstable_mockModule("../repositories/usersRepository.js", () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

const {
  createEntry,
  getEntry,
  getEntryForEdit,
  updateEntry,
  deleteEntry,
  listEntries,
  listEntriesForPage,
} = await import("../services/entriesService.js");
const { findById, getAll, updateById } =
  await import("../repositories/entriesRepository.js");
const usersRepository = await import("../repositories/usersRepository.js");

const alice = { id: "alice-id" };
const bob = { id: "bob-id" };
const admin = { id: "admin-id" };

test("createEntry rejects a missing title", async () => {
  const result = await createEntry({ title: "", body: "something" }, alice);
  expect(result.ok).toBe(false);
});

test("createEntry saves a valid entry, stamped with the actor as ownerId, but never exposes ownerId in its DTO", async () => {
  const result = await createEntry(
    { title: "Groceries", body: "Milk, eggs" },
    alice,
  );
  expect(result.ok).toBe(true);
  expect(result.value).toEqual({
    id: "fake-id",
    title: "Groceries",
    body: "Milk, eggs",
  });
  expect(result.value.ownerId).toBeUndefined();
});

test("updateEntry returns a 404-shaped Err when the entry does not exist", async () => {
  findById.mockResolvedValueOnce(null);
  const result = await updateEntry(
    "000000000000000000000000",
    { title: "x", body: "y" },
    alice,
  );
  expect(result.ok).toBe(false);
  expect(result.error.status).toBe(404);
});

test("updateEntry returns a 403-shaped Err when a non-owner, non-admin actor tries to modify it", async () => {
  findById.mockResolvedValueOnce({
    _id: "e1",
    ownerId: { toString: () => "alice-id" },
    title: "t",
    body: "b",
  });
  usersRepository.findById.mockResolvedValueOnce({ role: "member" });
  const result = await updateEntry("e1", { title: "x", body: "y" }, bob);
  expect(result.ok).toBe(false);
  expect(result.error.status).toBe(403);
});

test("updateEntry allows the owner to modify it without ever consulting usersRepository", async () => {
  usersRepository.findById.mockClear();
  findById.mockResolvedValueOnce({
    _id: "e1",
    ownerId: { toString: () => "alice-id" },
    title: "t",
    body: "b",
  });
  updateById.mockResolvedValueOnce({ _id: "e1", title: "x", body: "y" });
  const result = await updateEntry("e1", { title: "x", body: "y" }, alice);
  expect(result.ok).toBe(true);
  expect(usersRepository.findById).not.toHaveBeenCalled();
});

test("updateEntry allows an admin to modify an entry they do not own", async () => {
  findById.mockResolvedValueOnce({
    _id: "e1",
    ownerId: { toString: () => "alice-id" },
    title: "t",
    body: "b",
  });
  usersRepository.findById.mockResolvedValueOnce({ role: "admin" });
  updateById.mockResolvedValueOnce({ _id: "e1", title: "x", body: "y" });
  const result = await updateEntry("e1", { title: "x", body: "y" }, admin);
  expect(result.ok).toBe(true);
});

test("deleteEntry returns a 404-shaped Err when the entry does not exist", async () => {
  findById.mockResolvedValueOnce(null);
  const result = await deleteEntry("000000000000000000000000", alice);
  expect(result.ok).toBe(false);
  expect(result.error.status).toBe(404);
});

test("deleteEntry returns a 403-shaped Err when a non-owner, non-admin actor tries to delete it", async () => {
  findById.mockResolvedValueOnce({
    _id: "e1",
    ownerId: { toString: () => "alice-id" },
    title: "t",
    body: "b",
  });
  usersRepository.findById.mockResolvedValueOnce({ role: "member" });
  const result = await deleteEntry("e1", bob);
  expect(result.ok).toBe(false);
  expect(result.error.status).toBe(403);
});

test("listEntries returns entries sorted by title, alphabetically", async () => {
  getAll.mockResolvedValueOnce([
    { _id: "1", title: "Zebra", body: "z" },
    { _id: "2", title: "Apple", body: "a" },
    { _id: "3", title: "Mango", body: "m" },
  ]);
  const result = await listEntries();
  expect(result.map((entry) => entry.title)).toEqual([
    "Apple",
    "Mango",
    "Zebra",
  ]);
});

test("getEntry returns a 404-shaped Err when the entry does not exist", async () => {
  findById.mockResolvedValueOnce(null);
  const result = await getEntry("000000000000000000000000");
  expect(result.ok).toBe(false);
  expect(result.error.status).toBe(404);
});

test("getEntry returns the entry as a DTO", async () => {
  findById.mockResolvedValueOnce({
    _id: "fake-id",
    title: "Groceries",
    body: "Milk",
    favorite: true,
  });
  const result = await getEntry("fake-id");
  expect(result.ok).toBe(true);
  expect(result.value).toEqual({
    id: "fake-id",
    title: "Groceries",
    body: "Milk",
    favorite: true,
  });
});

test("getEntryForEdit returns a 403-shaped Err to a non-owner, non-admin actor", async () => {
  findById.mockResolvedValueOnce({
    _id: "e1",
    ownerId: { toString: () => "alice-id" },
    title: "t",
    body: "b",
  });
  usersRepository.findById.mockResolvedValueOnce({ role: "member" });
  const result = await getEntryForEdit("e1", bob);
  expect(result.ok).toBe(false);
  expect(result.error.status).toBe(403);
});

test("getEntryForEdit gives the owner the entry as a DTO, without ownerId", async () => {
  findById.mockResolvedValueOnce({
    _id: "e1",
    ownerId: { toString: () => "alice-id" },
    title: "t",
    body: "b",
    favorite: false,
  });
  const result = await getEntryForEdit("e1", alice);
  expect(result.ok).toBe(true);
  expect(result.value).toEqual({
    id: "e1",
    title: "t",
    body: "b",
    favorite: false,
  });
});

test("listEntriesForPage marks only the owner's entries as changeable, and leaks no ownerId", async () => {
  getAll.mockResolvedValueOnce([
    {
      _id: "1",
      title: "Mine",
      body: "a",
      ownerId: { toString: () => "alice-id" },
    },
    {
      _id: "2",
      title: "Theirs",
      body: "b",
      ownerId: { toString: () => "bob-id" },
    },
  ]);
  const result = await listEntriesForPage({ id: "alice-id", role: "member" });
  expect(result.map((e) => [e.title, e.canChange])).toEqual([
    ["Mine", true],
    ["Theirs", false],
  ]);
  expect(result.every((e) => !("ownerId" in e))).toBe(true);
});

test("listEntriesForPage lets an admin change every entry", async () => {
  getAll.mockResolvedValueOnce([
    {
      _id: "2",
      title: "Theirs",
      body: "b",
      ownerId: { toString: () => "bob-id" },
    },
  ]);
  const result = await listEntriesForPage({ id: "admin-id", role: "admin" });
  expect(result[0].canChange).toBe(true);
});

test("listEntriesForPage logged out: nothing is changeable", async () => {
  getAll.mockResolvedValueOnce([
    {
      _id: "1",
      title: "Mine",
      body: "a",
      ownerId: { toString: () => "alice-id" },
    },
  ]);
  const result = await listEntriesForPage(undefined);
  expect(result[0].canChange).toBe(false);
});
