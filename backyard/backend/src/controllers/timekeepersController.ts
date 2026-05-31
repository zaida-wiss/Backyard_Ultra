import type { NextFunction, Request, Response } from "express";

import HttpError from "../errors/httpError.js";
import {
  addRole,
  hasRole,
  toOrganizerAccount,
  toPublicUser,
  toRunnerAccount,
  UserModel,
} from "../models/user.model.js";
import { setAuthCookie } from "../utils/authCookie.js";
import { createToken } from "../utils/jwt.js";

const becomeTimekeeper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad");
    }

    const user = await UserModel.findById(req.authUser.id);

    if (!user) {
      throw new HttpError(401, "UNAUTHORIZED", "Användaren finns inte längre");
    }

    addRole(user, "timekeeper");
    await user.save();

    const token = createToken({ id: user.id, email: user.email }, user.roles);

    setAuthCookie(res, token);

    return res.json({
      user: toPublicUser(user),
      runner: hasRole(user, "runner") ? toRunnerAccount(user) : null,
      organizer: hasRole(user, "organizer") || hasRole(user, "admin")
        ? toOrganizerAccount(user)
        : null,
    });
  } catch (error) {
    return next(error);
  }
};

export { becomeTimekeeper };
