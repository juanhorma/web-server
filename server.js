import express from "express";
// new commit changed git config to my umass email
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

const entries = [
  { title: "first note", body: "Juan" },
  { title: "second note", body: "Hormaechea" },
  { title: "third note", body: "Casanueva" },
];

const events = [
  { title: "Career fair", date: String(new Date(1995, 8, 13)) },
  { title: "Hackathon kickoff", date: String(new Date(2018, 3, 14)) },
  { title: "non date event" },
];
/* const events = []; */

app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", (req, res) => {
  res.send("Hello, web!");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "about" });
});

app.get("/contact", (req, res) => {
  res.send("email@gmail.com");
});

app.get("/projects", (req, res) => {
  res.send("full stack project");
});

app.get("/about-me", (req, res) => {
  res.send("compsci student");
});

app.get("/status", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/hello/:name", (req, res) => {
  res.send(`Hello ${req.params.name}!`);
});

app.get("/repeat/:word", (req, res) => {
  const word = req.params.word;
  res.send(`${word}, ${word}, ${word}`);
});

app.get("/count", (req, res) => {
  const from = Number.parseInt(req.query.from) || 1;
  const to = Number.parseInt(req.query.to) || 10;
  res.send(`Counting from ${from} to ${to}`);
});

app.get("/api/info", (req, res) => {
  res.json({ name: "Juan", profession: "student" });
});

app.get("/api/error", (req, res) => {
  res.status(404).send("bad request");
});

app.get("/entries", (req, res) => {
  res.render("entries", {
    title: "My notes",
    entries: entries,
  });
});

app.get("/entries/:id", (req, res) => {
  const id = req.params.id;
  if (id >= entries.length || id < 0) {
    return res.status(404).send("index out of bounds");
  }

  const entry = [entries[id]];

  res.render("entries", { title: "My notes", entries: entry });
});

app.get("/events", (req, res) => {
  res.render("events", { events });
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
