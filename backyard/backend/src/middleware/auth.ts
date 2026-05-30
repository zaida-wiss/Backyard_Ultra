import type { NextFunction, Request, Response } from "express";

import HttpError from "../errors/httpError";
import { OrganizerModel, toPublicOrganizer } from "../models/organizer.model";
import { RunnerAccountModel, toPublicRunnerAccount } from "../models/runnerAccount.model";
import { verifyToken } from "../utils/security";
import type { TokenPayload } from "../types/domain";
import type { AuthRole } from "../types/domain";


const getBearerToken = (req: Request) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.replace("Bearer ", "");
};

const getTokenPayload = (req: Request): TokenPayload => {
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
  if (payload.role !== expectedRole) {
    throw new HttpError(403, "FORBIDDEN", message);
  }
};

const getOrganizerFromPayload = async (payload: TokenPayload) => {
  requirePayloadRole(payload, "organizer", "Du måste vara inloggad som arrangör");

  const organizer = await OrganizerModel.findById(payload.sub);

  if (!organizer) {
    throw new HttpError(401, "UNAUTHORIZED", "Arrangören finns inte längre");
  }

  return toPublicOrganizer(organizer);
};

const getRunnerAccountFromPayload = async (payload: TokenPayload) => {
  requirePayloadRole(payload, "runner", "Du måste vara inloggad som löpare");

  const runnerAccount = await RunnerAccountModel.findById(payload.sub);

  if (!runnerAccount) {
    throw new HttpError(401, "UNAUTHORIZED", "Löparkontot finns inte längre");
  }

  return toPublicRunnerAccount(runnerAccount);
};

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.organizer = await getOrganizerFromPayload(getTokenPayload(req));
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireRunnerAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.runnerAccount = await getRunnerAccountFromPayload(getTokenPayload(req));
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireRole = (...allowedRoles: AuthRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const userRole = req.authUser?.role;

      if (!userRole || !allowedRoles.includes(userRole)) {
        throw new HttpError(403, "FORBIDDEN", "Du saknar behörighet");
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};