import { beforeEach, jest } from "@jest/globals";

jest.unstable_mockModule("../repositories/entriesRepository.js", () => ({
  isValidId: jest.fn(() => true),
  getAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  removeById: jest.fn(),
}));

const { findById, create } =
  await import("../repositories/entriesRepository.js");

const { createEntry, updateEntry, deleteEntry } =
  await import("../services/entriesService.js");

beforeEach(() => {
  jest.clearAllMocks();
});

test("createEntry rejects a missing title", async () => {
  create.mockResolvedValue({
    _id: "fake-id",
    title: "fake title",
    body: "fake body",
  });
  const result = await createEntry({ title: "", body: "something" });
  expect(result.ok).toBe(false);
});

test("createEntry saves a valid entry and returns its DTO", async () => {
  create.mockResolvedValue({
    _id: "fake-id",
    title: "Groceries",
    body: "Milk, eggs",
  });
  const result = await createEntry({ title: "Groceries", body: "Milk, eggs" });
  expect(result.ok).toBe(true);
  expect(result.value).toEqual({
    id: "fake-id",
    title: "Groceries",
    body: "Milk, eggs",
  });
});

test("updateEntry returns an Error upon a missing entry", async () => {
  findById.mockResolvedValue(null);
  const result = await updateEntry(5, {
    title: "Groceries",
    body: "Milk, eggs",
  });
  expect(result.ok).toBe(false);
  expect(result.error.status).toBe(404);
  expect(result.error.message).toBe("Entry not found");
});

test("deleteEntry returns an Error upon a missing entry", async () => {
  findById.mockResolvedValue(null);
  const result = await deleteEntry(5);
  expect(result.ok).toBe(false);
  expect(result.error.status).toBe(404);
  expect(result.error.message).toBe("Entry not found");
});
