import * as authService from "../services/authService.js";
import { createSession, destroySession } from "../sessions.js";
import * as usersRepository from "../repositories/usersRepository.js";
import { toUserDto } from "../dtos/userDto.js";

// The same routes answer two kinds of caller. A form on the page sends
// application/x-www-form-urlencoded and gets a page back: a redirect when it
// worked (Post/Redirect/Get), or the form again with the error. Anything else
// (curl with a JSON body, a test) gets JSON, exactly as in Unit 17.
const fromForm = (req) => Boolean(req.is("application/x-www-form-urlencoded"));

const startSession = (req, res, userId) => {
  const sessionId = createSession(userId);
  const cookieOptions = { signed: true, httpOnly: true };
  if (req.body.rememberMe) {
    cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000;
  }
  res.cookie("sessionId", sessionId, cookieOptions);
};

export const signupPage = (req, res) => {
  if (req.user) return res.redirect("/entries");
  res.render("signup", { title: "Sign up", error: null, email: "" });
};

export const loginPage = (req, res) => {
  if (req.user) return res.redirect("/entries");
  res.render("login", { title: "Log in", error: null, email: "" });
};

export const signup = async (req, res) => {
  const result = await authService.signup(req.body);
  if (!fromForm(req)) {
    if (!result.ok) {
      res.status(result.error.status).json({ error: result.error.message });
      return;
    }
    res.status(201).json(result.value);
    return;
  }
  if (!result.ok) {
    res
      .status(result.error.status)
      .render("signup", {
        title: "Sign up",
        error: result.error.message,
        email: req.body.email || "",
      });
    return;
  }
  // From the page, signing up also logs you in: nobody wants to type it twice.
  startSession(req, res, result.value.id);
  res.redirect(303, "/entries");
};

export const login = async (req, res) => {
  const result = await authService.login(req.body);
  if (!result.ok) {
    if (fromForm(req)) {
      res
        .status(result.error.status)
        .render("login", {
          title: "Log in",
          error: result.error.message,
          email: req.body.email || "",
        });
      return;
    }
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }

  startSession(req, res, result.value._id.toString());
  if (fromForm(req)) {
    res.redirect(303, "/entries");
    return;
  }
  res.status(200).json({ loggedIn: true });
};

export const logout = (req, res) => {
  const sessionId = req.signedCookies.sessionId;
  if (sessionId) destroySession(sessionId);
  res.clearCookie("sessionId");
  if (fromForm(req)) {
    res.redirect(303, "/login");
    return;
  }
  res.status(200).send("");
};

export const me = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "not logged in" });
    return;
  }

  const user = await usersRepository.findById(req.user.id);
  if (!user) {
    res.status(401).json({ error: "not logged in" });
    return;
  }

  res.status(200).json(toUserDto(user));
};
