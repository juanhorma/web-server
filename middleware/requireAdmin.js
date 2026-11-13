const message = "You must be admin in to do that.";

export const requireAdmin = async (req, res) => {
  const userIsAdmin =
    (await usersRepository.findById(actor.id))?.role === "admin";

  if (userIsAdmin) {
    next();
  } else {
    if (req.get("HX-Request") === "true") {
      res.set("HX-Redirect", "/login");
      res.status(401).send(message);
      return;
    }
    if (req.is("application/x-www-form-urlencoded")) {
      res.redirect(303, "/login");
      return;
    }
    res.status(401).json({ error: message });
  }
};
