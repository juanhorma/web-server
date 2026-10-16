export const toEntryDto = (entry) => ({
  id: entry._id.toString(),
  title: entry.title,
  body: entry.body,
});
