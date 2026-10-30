let focusedBefore = null;

document.addEventListener("htmx:beforeRequest", () => {
  focusedBefore = document.activeElement;
});

document.addEventListener("htmx:afterRequest", (event) => {
  if (document.activeElement !== document.body) return;
  // A failed request: htmx re-enabled the button, still on the page.
  if (focusedBefore.isConnected) {
    focusedBefore.focus();
    return;
  }
  // The server sent a fresh copy of it with the same id (Favorite, Add entry).
  const copy = focusedBefore.id && document.getElementById(focusedBefore.id);
  if (copy) {
    copy.focus();
    return;
  }
  // The entry was deleted: focus the list it was in.
  if (event.detail.requestConfig.verb === "delete") {
    document.querySelector("#entries").focus();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.altKey && event.shiftKey && event.code === "KeyN") {
    event.preventDefault();
    document.querySelector("#entry-title").focus();
  }
});
