import express from "express";
import { readFile, writeFile } from "fs/promises";
// new commit changed git config to my umass email
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

const entries = [
  { id: 0, title: "first note", body: "Juan" },
  { id: 1, title: "second note", body: "Hormaechea" },
  { id: 2, title: "third note", body: "Casanueva" },
];

const events = [
  { title: "Career fair", date: String(new Date(1995, 8, 13)) },
  { title: "Hackathon kickoff", date: String(new Date(2018, 3, 14)) },
  { title: "non date event" },
];

const wishlist = [];

app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", (req, res) => {
  res.status(200).send("Hello, web!");
});

app.get("/about", (req, res) => {
  res.status(200).render("about", { title: "about" });
});

app.get("/contact", (req, res) => {
  res.status(200).send("email@gmail.com");
});

app.get("/projects", (req, res) => {
  res.status(200).send("full stack project");
});

app.get("/about-me", (req, res) => {
  res.status(200).send("compsci student");
});

app.get("/status", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.get("/hello/:name", (req, res) => {
  res.status(200).send(`Hello ${req.params.name}!`);
});

app.get("/repeat/:word", (req, res) => {
  const word = req.params.word;
  res.status(200).send(`${word}, ${word}, ${word}`);
});

app.get("/count", (req, res) => {
  const from = Number.parseInt(req.query.from) || 1;
  const to = Number.parseInt(req.query.to) || 10;
  res.status(200).send(`Counting from ${from} to ${to}`);
});

app.get("/api/info", (req, res) => {
  res.status(200).json({ name: "Juan", profession: "student" });
});

app.get("/api/error", (req, res) => {
  res.status(404).send("bad request");
});

app.get("/entries", async (req, res) => {
  const data = await readFile("entries.json", "utf-8");
  const my_entries = JSON.parse(data);
  res.set("Total-Count", my_entries.length);
  res.status(200).render("entries", { entries: my_entries });
});

app.get("/entries/:id", async (req, res) => {
  const id = req.params.id;
  const data = await readFile("entries.json", "utf-8");
  const my_entries = JSON.parse(data);
  if (id > my_entries.at(-1).id || id < 0) {
    return res.status(404).send("index out of bounds");
  }

  let my_entry = null;
  for (const entry of my_entries) {
    if (entry.id == id) {
      my_entry = entry;
      break;
    }
  }

  if (my_entry == null) {
    res.status(404).send("Not Found");
    return;
  }

  my_entry = [my_entry];

  res.status(200).render("entries", { title: "My notes", entries: my_entry });
});

app.get("/events", (req, res) => {
  res.status(200).render("events", { events });
});

app.post("/entries", async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    res.status(400).json({ error: "title and body are required" });
    return;
  }
  const data = await readFile("entries.json", "utf-8");
  const my_entries = JSON.parse(data);
  const new_id = my_entries.at(-1).id + 1;
  const new_entry = { id: new_id, title, body };
  my_entries.push(new_entry);
  await writeFile("entries.json", JSON.stringify(my_entries), "utf8");
  // res.status(201).json(new_entry);
  res.status(201).json(new_entry);
});

app.post("/entries/classic", async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    res.status(400).send("title and body are required");
    return;
  }

  const data = await readFile("entries.json", "utf-8");
  const entries = JSON.parse(data);
  const new_id = entries.at(-1).id + 1;
  entries.push({ id: new_id, title, body });
  await writeFile("entries.json", JSON.stringify(entries, null, 2));

  res.redirect("/entries");
});

app.delete("/entries/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id);
  const data = await readFile("entries.json", "utf-8");
  const my_entries = JSON.parse(data);
  if (
    Number.isNaN(id) ||
    id < 0 ||
    my_entries.length == 0 ||
    id > my_entries.at(-1).id
  ) {
    res.set("Total-Count", my_entries.length);
    res.status(404).send("Not found");
    return;
  }
  let my_entry = null;
  for (const entry of my_entries) {
    if (entry.id == id) {
      my_entry = entry;
      break;
    }
  }

  if (my_entry == null) {
    res.status(404).send("Not Found");
    return;
  }

  my_entries.splice(my_entries.indexOf(my_entry), 1);
  await writeFile("entries.json", JSON.stringify(my_entries), "utf8");
  res.set("Total-Count", my_entries.length);

  res.status(202).json(my_entries);
});

app.get("/wishlist", (req, res) => {
  res.status(200).json(wishlist);
});

app.post("/wishlist", (req, res) => {
  const { item, note } = req.body;
  // your decision goes here
  const newItem = { item, note };
  if (!item) {
    res.status(400).send("Missing field: item");
    return;
  }

  if (!note) {
    res.status(404).send("Missing field: note");
    return;
  }

  wishlist.push(newItem);
  res.status(201).json(newItem);
});

app.get("/three-posts", async (req, res) => {
  const ids = [1, 2, 3];
  const data = await Promise.all(
    ids.map(async (id) => {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${id}`,
      );

      return response.json();
    }),
  );

  const titles = data.map((payload) => payload.title);
  res.status(200).json({ titles });
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
