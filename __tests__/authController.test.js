import { jest } from "@jest/globals";

// The same routes answer a form on the page and a JSON caller (curl).
// These tests drive the controller with fake requests of both kinds.
jest.unstable_mockModule("../services/authService.js", () => ({
  signup: jest.fn(),
  login: jest.fn(),
}));
jest.unstable_mockModule("../sessions.js", () => ({
  createSession: jest.fn(() => "new-session-id"),
  destroySession: jest.fn(),
  getSession: jest.fn(),
}));
jest.unstable_mockModule("../repositories/usersRepository.js", () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
}));

const authController = await import("../controllers/authController.js");
const authService = await import("../services/authService.js");
const sessions = await import("../sessions.js");
const { Ok, Err } = await import("../result.js");

const request = (kind, body = {}, extra = {}) => ({
  body,
  signedCookies: {},
  is: (type) =>
    (kind === "form" && type === "application/x-www-form-urlencoded") ||
    (kind === "json" && type === "application/json"),
  ...extra,
});
const response = () => {
  const res = { statusCode: 200, cookies: [] };
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((body) => {
    res.body = body;
    return res;
  });
  res.send = jest.fn((body) => {
    res.body = body;
    return res;
  });
  res.render = jest.fn((view, data) => {
    res.view = view;
    res.data = data;
    return res;
  });
  res.redirect = jest.fn((code, where) => {
    res.statusCode = code;
    res.location = where;
    return res;
  });
  res.cookie = jest.fn((name, value, options) => {
    res.cookies.push({ name, value, options });
    return res;
  });
  res.clearCookie = jest.fn(() => res);
  return res;
};

beforeEach(() => jest.clearAllMocks());

test("a form login that works sets the session cookie and redirects to /entries with 303", async () => {
  authService.login.mockResolvedValueOnce(Ok({ _id: "u1" }));
  const res = response();
  await authController.login(
    request("form", { email: "a@b.c", password: "pw" }),
    res,
  );
  expect(res.redirect).toHaveBeenCalledWith(303, "/entries");
  expect(res.cookies[0]).toMatchObject({
    name: "sessionId",
    value: "new-session-id",
    options: { signed: true, httpOnly: true },
  });
});

test("a form login that fails shows the login page again with the error and the email, and no cookie", async () => {
  authService.login.mockResolvedValueOnce(
    Err({ status: 401, message: "incorrect email or password" }),
  );
  const res = response();
  await authController.login(
    request("form", { email: "a@b.c", password: "nope" }),
    res,
  );
  expect(res.statusCode).toBe(401);
  expect(res.view).toBe("login");
  expect(res.data).toMatchObject({
    error: "incorrect email or password",
    email: "a@b.c",
  });
  expect(res.cookies).toHaveLength(0);
});

test("a JSON login still answers 200 {loggedIn: true}, as in Unit 17", async () => {
  authService.login.mockResolvedValueOnce(Ok({ _id: "u1" }));
  const res = response();
  await authController.login(
    request("json", { email: "a@b.c", password: "pw" }),
    res,
  );
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ loggedIn: true });
  expect(res.redirect).not.toHaveBeenCalled();
});

test("a JSON login that fails still answers JSON with the error", async () => {
  authService.login.mockResolvedValueOnce(
    Err({ status: 401, message: "incorrect email or password" }),
  );
  const res = response();
  await authController.login(
    request("json", { email: "a@b.c", password: "nope" }),
    res,
  );
  expect(res.statusCode).toBe(401);
  expect(res.body).toEqual({ error: "incorrect email or password" });
});

test("a remembered form login keeps the cookie for 30 days", async () => {
  authService.login.mockResolvedValueOnce(Ok({ _id: "u1" }));
  const res = response();
  await authController.login(
    request("form", { email: "a@b.c", password: "pw", rememberMe: "on" }),
    res,
  );
  expect(res.cookies[0].options.maxAge).toBe(30 * 24 * 60 * 60 * 1000);
});

test("a form signup logs the new user in and redirects to /entries", async () => {
  authService.signup.mockResolvedValueOnce(Ok({ id: "u2", email: "new@b.c" }));
  const res = response();
  await authController.signup(
    request("form", { email: "new@b.c", password: "pw" }),
    res,
  );
  expect(sessions.createSession).toHaveBeenCalledWith("u2");
  expect(res.redirect).toHaveBeenCalledWith(303, "/entries");
});

test("a form signup for a taken email shows the signup page with a 409 and the email kept", async () => {
  authService.signup.mockResolvedValueOnce(
    Err({ status: 409, message: "that email is already registered" }),
  );
  const res = response();
  await authController.signup(
    request("form", { email: "taken@b.c", password: "pw" }),
    res,
  );
  expect(res.statusCode).toBe(409);
  expect(res.view).toBe("signup");
  expect(res.data).toMatchObject({
    error: "that email is already registered",
    email: "taken@b.c",
  });
  expect(sessions.createSession).not.toHaveBeenCalled();
});

test("a JSON signup still answers 201 with the user and does not log in", async () => {
  authService.signup.mockResolvedValueOnce(Ok({ id: "u2", email: "new@b.c" }));
  const res = response();
  await authController.signup(
    request("json", { email: "new@b.c", password: "pw" }),
    res,
  );
  expect(res.statusCode).toBe(201);
  expect(res.body).toEqual({ id: "u2", email: "new@b.c" });
  expect(sessions.createSession).not.toHaveBeenCalled();
});

test("a form logout ends the session and redirects to /login", () => {
  const res = response();
  authController.logout(
    request("form", {}, { signedCookies: { sessionId: "s1" } }),
    res,
  );
  expect(sessions.destroySession).toHaveBeenCalledWith("s1");
  expect(res.redirect).toHaveBeenCalledWith(303, "/login");
});

test("a logout with no form body (curl) still answers 200 with an empty body", () => {
  const res = response();
  authController.logout(
    request("none", {}, { signedCookies: { sessionId: "s1" } }),
    res,
  );
  expect(sessions.destroySession).toHaveBeenCalledWith("s1");
  expect(res.statusCode).toBe(200);
  expect(res.body).toBe("");
});

test("the login page sends someone already logged in on to their notes", () => {
  const res = response();
  authController.loginPage(request("none", {}, { user: { id: "u1" } }), res);
  expect(res.redirect).toHaveBeenCalledWith("/entries");
});
