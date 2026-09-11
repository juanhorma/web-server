import { Router } from "express";
const router = Router();

const projects = [
  { name: "Weather app", tag: "javascript" },
  { name: "Portfolio site", tag: "express" },
  { name: "Budget tracker", tag: "python" },
];

router.get("/projects", (req, res) => {
  const tag = req.query.tag;
  const name = req.query.sort;
  let filtered;
  // filter `projects` here, based on your decision above
  if (tag === undefined && name === undefined) {
    return res.json({ projects: projects });
  }

  if (name === undefined) {
    filtered = projects.filter((n) => n.tag === tag);
  } else if (tag === undefined) {
    filtered = projects.filter((n) => n.name === name);
  } else {
    filtered = projects.filter((n) => n.name === name && n.tag === tag);
  }

  if (filtered.length === 0) {
    return res.status(404).send("not matching projects");
  }

  res.json({ projects: filtered });
});

export default router;
