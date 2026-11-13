export const toEntryDto = (entry) => ({
  id: entry._id.toString(),
  title: entry.title,
  body: entry.body,
  favorite: entry.favorite,
});

// For the page only, never for a JSON answer: the entry plus whether the
// person looking at it may change it, so entry.ejs shows Edit and Delete only
// to them. ownerId itself still never leaves the server.
export const toEntryView = (entry, canChange) => ({
  ...toEntryDto(entry),
  canChange,
});

export const toAdminEntryDto = (entry) => ({
  ...toEntryDto(entry),
  ownerId: entry.ownerId.toString(),
});
