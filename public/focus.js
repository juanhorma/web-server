// The one script this app still has. htmx and the server decide what the
// page shows; this file only handles what lives in the browser alone:
// where keyboard focus goes, and a keyboard shortcut.

// What had focus when the latest htmx request went out.
let focusedBefore = null;

document.addEventListener("htmx:beforeRequest", () => {
  focusedBefore = document.activeElement;
});

// hx-disabled-elt disables the pressed button while its request is out,
// and a swap can replace the focused element outright. Either way the
// browser drops focus to the page itself. When the request is over, put
// focus back somewhere real. htmx fires afterRequest for every outcome, and
// when the element that sent the request is gone, fires it again on the
// nearest ancestor still on the page, so it still reaches document.
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

// Alt+Shift+N from anywhere on the page jumps to the title field. event.code
// names the physical key; on a Mac, Option+Shift+N makes event.key '˜'.
document.addEventListener("keydown", (event) => {
  if (event.altKey && event.shiftKey && event.code === "KeyN") {
    event.preventDefault();
    // Logged out there is no add form, so no title field to jump to.
    document.querySelector("#entry-title")?.focus();
  }
});
