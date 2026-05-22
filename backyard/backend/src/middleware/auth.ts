import type { NextFunction, Request, Response } from "express";
import { organizers, runnerAccounts } from "../data/store";
import HttpError from "../errors/httpError";
import { verifyToken } from "../utils/security";

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad som arrangör'));
  }

  const token = header.replace('Bearer ', '');
  const payload = verifyToken(token);

  if (!payload) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Token saknas eller är ogiltig'));
  }

  if (payload.role !== "organizer") {
    return next(new HttpError(403, 'FORBIDDEN', 'Du måste vara inloggad som arrangör'));
  }

  const organizer = organizers.find((currentOrganizer) => currentOrganizer.id === payload.sub);

  if (!organizer) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Arrangören finns inte längre'));
  }

  req.organizer = organizer;
  return next();
};

export const requireRunnerAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad som löpare'));
  }

  const token = header.replace('Bearer ', '');
  const payload = verifyToken(token);

  if (!payload) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Token saknas eller är ogiltig'));
  }

  if (payload.role !== "runner") {
    return next(new HttpError(403, 'FORBIDDEN', 'Du måste vara inloggad som löpare'));
  }

  const runnerAccount = runnerAccounts.find((currentRunner) => currentRunner.id === payload.sub);

  if (!runnerAccount) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Löparkontot finns inte längre'));
  }

  req.runnerAccount = runnerAccount;
  return next();
};
