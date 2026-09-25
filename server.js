import express from "express";
// new commit changed git config to my umass email
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
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

app.get("/entries", (req, res) => {
  res.set("Total-Count", `${entries.length}`);
  res.set("Cache-Control", "public, max-age=60");
  /* res.status(200).render("entries", {
    title: "My notes",
    entries: entries,
  }); */

  res.status(200).json(entries);
});

app.get("/entries/:id", (req, res) => {
  const id = req.params.id;
  if (id > entries.at(-1).id || id < 0) {
    return res.status(404).send("index out of bounds");
  }

  let my_entry = null;
  for (const entry of entries) {
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

app.post("/entries", (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    res.status(400).json({ error: "title and body are required" });
    return;
  }
  const new_entry = { title, body };
  entries.push(new_entry);
  res.status(201).json(new_entry);
});

app.delete("/entries/:id", (req, res) => {
  const id = Number.parseInt(req.params.id);
  if (
    Number.isNaN(id) ||
    id < 0 ||
    entries.length == 0 ||
    id > entries.at(-1).id
  ) {
    res.set("Total-Count", entries.length);
    res.status(404).send("Not found");
    return;
  }
  let my_entry = null;
  for (const entry of entries) {
    if (entry.id == id) {
      my_entry = entry;
      break;
    }
  }

  if (my_entry == null) {
    res.status(404).send("Not Found");
    return;
  }

  entries.splice(entries.indexOf(my_entry), 1);
  res.set("Total-Count", entries.length);
  res.status(202).json(entries);
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

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
