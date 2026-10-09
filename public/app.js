const form = document.querySelector("#entry-form");
const list = document.querySelector("#entries");
const formError = document.querySelector("#form-error");
const showError = (message) => {
  formError.textContent = message;
};

const fillDisplay = (display, entry) => {
  const title = document.createElement("strong");
  title.textContent = `${entry.title}:`;
  display.replaceChildren(title, ` ${entry.body}`);
};

const makeButton = (className, label) => {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.textContent = label;
  return button;
};

const buildItem = (entry) => {
  const item = document.createElement("li");
  item.dataset.id = entry.id;
  item.dataset.title = entry.title;
  item.dataset.body = entry.body;

  const text = document.createElement("span");
  text.className = "entry-display";
  const title = document.createElement("strong");
  title.textContent = `${entry.title}:`;
  text.append(title, ` ${entry.body}`);

  const editButton = makeButton("edit-btn", "Edit");

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";

  item.append(text, editButton, deleteButton);
  return item;
};

const makeInput = (name, value) => {
  const input = document.createElement("input");
  input.type = "text";
  input.name = name;
  input.value = value;
  return input;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const entry = Object.fromEntries(data);
  let response;
  try {
    response = await fetch("/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(2000),
    });
  } catch (error) {
    showError(
      error.name == "TimeoutError"
        ? "Server took too long to respond"
        : error.message,
    );
    return;
  }

  if (!response.ok) {
    const { error } = await response.json();
    showError(error);
    return;
  }

  showError("");
  const saved = await response.json();

  list.append(buildItem(saved));

  form.reset();
});

const startEdit = (item) => {
  const display = item.querySelector(".entry-display");
  const editBtn = item.querySelector(".edit-btn");
  if (editBtn) editBtn.hidden = true;

  const currentTitle =
    item.dataset.title ??
    display.querySelector("strong")?.textContent.replace(/:$/, "").trim() ??
    "";
  const currentBody =
    item.dataset.body ??
    display.textContent.replace(display.querySelector("strong")?.textContent ?? "", "").trim();

  const editForm = document.createElement("form");
  const save = document.createElement("button");
  save.type = "submit";
  save.textContent = "Save";

  const cancel = makeButton("cancel-btn", "Cancel");
  cancel.addEventListener("click", () => {
    editForm.replaceWith(display);
    if (editBtn) editBtn.hidden = false;
  });

  editForm.append(
    makeInput("title", currentTitle),
    makeInput("body", currentBody),
    save,
    cancel,
  );
  display.replaceWith(editForm);

  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const entry = Object.fromEntries(new FormData(editForm));
    save.disabled = true;
    try {
      const response = await fetch(`/entries/${item.dataset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        const { error } = await response.json();
        showError(error);
        return;
      }

      const saved = await response.json();
      item.dataset.id = saved.id;
      item.dataset.title = saved.title;
      item.dataset.body = saved.body;
      fillDisplay(display, saved);
      editForm.replaceWith(display);
      if (editBtn) editBtn.hidden = false;
    } catch {
      alert(
        "Your changes were not saved: the server did not answer properly. Please try again.",
      );
    } finally {
      save.disabled = false;
    }
  });
};

list.addEventListener("click", async (event) => {
  if (event.target.matches(".edit-btn")) {
    startEdit(event.target.closest("li"));
    return;
  }

  if (!event.target.matches(".delete-btn")) return;

  const button = event.target;
  const item = button.closest("li");
  const id = item.dataset.id;

  button.disabled = true;
  try {
    const response = await fetch(`/entries/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const { error } = await response.json();
      alert(error);
      button.disabled = false;
      return;
    }
    item.remove();
  } catch {
    button.disabled = false;
  }
});
