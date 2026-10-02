const form = document.querySelector("#entry-form");
const list = document.querySelector("#entries");
const formError = document.querySelector("#form-error");
const showError = (message) => {
  formError.textContent = message;
};

const buildItem = (entry) => {
  const item = document.createElement("li");
  item.dataset.id = entry.id;

  const text = document.createElement("span");
  const title = document.createElement("strong");
  title.textContent = `${entry.title}:`;
  text.append(title, ` ${entry.body}`);

  const button = document.createElement("button");
  button.className = "delete-btn";
  button.type = "button";
  button.textContent = "Delete";

  item.append(text, button);
  return item;
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

list.addEventListener("click", async (event) => {
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
