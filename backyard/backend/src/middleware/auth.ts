import type { NextFunction, Request, Response } from "express";

import HttpError from "../errors/httpError.js";
import { OrganizerModel, toPublicOrganizer } from "../models/organizer.model.js";
import { RunnerAccountModel, toPublicRunnerAccount } from "../models/runnerAccount.model.js";
import { verifyToken } from "../utils/jwt.js";
import type { AuthRole, AuthUser, TokenPayload } from "../types/domain.js";

const organizerRoles: AuthRole[] = ["admin", "organizer"];

const isOrganizerRole = (role: AuthRole) => {
  return organizerRoles.includes(role);
};

const getBearerToken = (req: Request) => {
  const header = req.headers.authorization;

  // API:t förväntar sig formatet: Authorization: Bearer <token>
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.replace("Bearer ", "");
};

const getTokenPayload = (req: Request): TokenPayload => {
  // Här gör vi om headern till verifierad token-data, eller stoppar requesten med 401.
  const token = getBearerToken(req);
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    throw new HttpError(401, "UNAUTHORIZED", "Token saknas eller är ogiltig");
  }

  return payload;
};

const requirePayloadRole = (
  payload: TokenPayload,
  expectedRole: TokenPayload["role"],
  message: string,
) => {
  // Används när en middleware bara accepterar en exakt roll.
  if (payload.role !== expectedRole) {
    throw new HttpError(403, "FORBIDDEN", message);
  }
};

const getOrganizerFromPayload = async (payload: TokenPayload) => {
  // Admin räknas som arrangör i arrangörsflöden, men kan släppas igenom av requireRole också.
  if (!isOrganizerRole(payload.role)) {
    throw new HttpError(403, "FORBIDDEN", "Du måste vara inloggad som arrangör");
  }

  // Vi hämtar användaren från databasen så en gammal token inte räcker om kontot är borttaget.
  const organizer = await OrganizerModel.findById(payload.sub);

  if (!organizer) {
    throw new HttpError(401, "UNAUTHORIZED", "Arrangören finns inte längre");
  }

  return toPublicOrganizer(organizer);
};

const getRunnerAccountFromPayload = async (payload: TokenPayload) => {
  requirePayloadRole(payload, "runner", "Du måste vara inloggad som löpare");

  // Samma princip här: tokenen säger vem användaren är, databasen bekräftar att kontot finns.
  const runnerAccount = await RunnerAccountModel.findById(payload.sub);

  if (!runnerAccount) {
    throw new HttpError(401, "UNAUTHORIZED", "Löparkontot finns inte längre");
  }

  return toPublicRunnerAccount(runnerAccount);
};

const setAuthUser = (req: Request, authUser: AuthUser) => {
  req.authUser = authUser;
};

const createAuthMiddleware = (
  loadAuthUser: (req: Request) => Promise<void>,
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await loadAuthUser(req);
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

const requireAuth = createAuthMiddleware(async (req) => {
  const organizer = await getOrganizerFromPayload(getTokenPayload(req));

  // req.organizer används av controllers som behöver arrangörens publika konto.
  req.organizer = organizer;
  // req.authUser är en gemensam auth-form som requireRole och loggern kan läsa.
  setAuthUser(req, {
    id: organizer.id,
    email: organizer.email,
    role: organizer.role,
  });
});

const requireRunnerAuth = createAuthMiddleware(async (req) => {
  const runnerAccount = await getRunnerAccountFromPayload(getTokenPayload(req));

  // req.runnerAccount används av controllers som jobbar med inloggad löpare.
  req.runnerAccount = runnerAccount;
  // Samma gemensamma auth-form som för arrangörer, men rollen sätts till runner.
  setAuthUser(req, {
    id: runnerAccount.id,
    email: runnerAccount.email,
    role: "runner",
  });
});

const requireRole = (...allowedRoles: AuthRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // requireAuth eller requireRunnerAuth måste ha körts före, annars finns ingen req.authUser.
      const userRole = req.authUser?.role;

      if (!userRole) {
        throw new HttpError(403, "FORBIDDEN", "Du saknar behörighet");
      }

      if (!allowedRoles.includes(userRole)) {
        throw new HttpError(403, "FORBIDDEN", "Du saknar behörighet");
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export { requireAuth, requireRole, requireRunnerAuth };
