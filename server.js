import express from "express";
import entriesRouter from "./routes/entries.js";
import morgan from "morgan";
// new commit changed git config to my umass email
const app = express();
const PORT = process.env.PORT || 3000;
// work in progress
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong.");
});
app.use((req, res, next) => {
  res.set("App-Version", 1.0);
  next();
});
app.use("/entries", entriesRouter);
app.disable("x-powered-by");

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

app.get("/events", (req, res) => {
  res.status(200).render("events", { events });
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

app.use((req, res) => {
  res.status(404).send("Page not found.");
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
