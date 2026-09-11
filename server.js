import express from "express";
import projectsRouter from "./projects.js";
// new commit changed git config to my umass email
const app = express();
const PORT = process.env.PORT || 3000;
app.use("/", projectsRouter);

app.get("/", (req, res) => {
  res.send("Hello, web!");
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

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
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
