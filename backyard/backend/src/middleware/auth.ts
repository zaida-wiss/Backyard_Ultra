import type { NextFunction, Request, Response } from "express";

import HttpError from "../errors/httpError.js";
import { hasRole, toOrganizerAccount, toPublicUser, toRunnerAccount, UserModel } from "../models/user.model.js";
import { verifyToken } from "../utils/jwt.js";
import type {
  AuthRole,
  AuthUser,
  TokenPayload,
} from "../types/domain.js";

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

const getUserFromPayload = async (payload: TokenPayload) => {
  // Vi hämtar användaren från databasen så en gammal token inte räcker om kontot är borttaget.
  const user = await UserModel.findById(payload.sub);

  if (!user) {
    throw new HttpError(401, "UNAUTHORIZED", "Användaren finns inte längre");
  }

  return user;
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

const loadUserOnRequest = async (req: Request) => {
  const userDocument = await getUserFromPayload(getTokenPayload(req));
  const user = toPublicUser(userDocument);

  req.user = user;
  // req.authUser är en gemensam auth-form som requireRole och loggern kan läsa.
  setAuthUser(req, {
    id: user.id,
    email: user.email,
    roles: user.roles,
  });

  if (hasRole(userDocument, "runner")) {
    req.runnerAccount = toRunnerAccount(userDocument);
  }

  if (user.roles.some(isOrganizerRole)) {
    req.organizer = toOrganizerAccount(userDocument);
  }
};

const requireAuth = createAuthMiddleware(loadUserOnRequest);

const requireRunnerAuth = createAuthMiddleware(async (req) => {
  await loadUserOnRequest(req);

  if (!req.authUser?.roles.includes("runner")) {
    throw new HttpError(403, "FORBIDDEN", "Du måste vara inloggad som löpare");
  }
});

const requireRole = (...allowedRoles: AuthRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // requireAuth eller requireRunnerAuth måste ha körts före, annars finns ingen req.authUser.
      const userRoles = req.authUser?.roles;

      if (!userRoles) {
        throw new HttpError(403, "FORBIDDEN", "Du saknar behörighet");
      }

      if (!allowedRoles.some((role) => userRoles.includes(role))) {
        throw new HttpError(403, "FORBIDDEN", "Du saknar behörighet");
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export { requireAuth, requireRole, requireRunnerAuth };
