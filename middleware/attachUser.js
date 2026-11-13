import { getSession } from "../sessions.js";
import * as usersRepository from "../repositories/usersRepository.js";
import { toUserDto } from "../dtos/userDto.js";

// Looks the account up once per request, so every layer and every view knows
// who is asking: req.user for the routes and the service (with the role, for
// the admin check), res.locals.user for the header ("Signed in as ...").
// A session whose account is gone counts as logged out.
export const attachUser = async (req, res, next) => {
  try {
    const sessionId = req.signedCookies.sessionId;
    const session = sessionId ? getSession(sessionId) : undefined;
    const account = session
      ? await usersRepository.findById(session.userId)
      : null;
    if (account) {
      req.user = {
        id: account._id.toString(),
        email: account.email,
        role: account.role,
      };
      res.locals.user = toUserDto(account);
    }
    next();
  } catch (err) {
    next(err);
  }
};
