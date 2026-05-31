import type { NextFunction, Request, Response } from "express";

import HttpError from "../errors/httpError.js";
import { clearAuthCookie } from "../utils/authCookie.js";

const getCurrentSession = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad"));
  }

  return res.json({
    user: req.user,
    runner: req.runnerAccount ?? null,
    organizer: req.organizer ?? null,
  });
};

const logout = (_req: Request, res: Response) => {
  clearAuthCookie(res);

  return res.status(204).send();
};

export { getCurrentSession, logout };
