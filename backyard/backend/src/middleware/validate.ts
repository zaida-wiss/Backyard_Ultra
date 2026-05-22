import type { NextFunction, Request, Response } from "express";
import {
  parseLogin,
  parseOrganizerRegistration,
} from "../schemas/organizerSchema";
import { parseCompetition } from "../schemas/competitionSchema";
import {
  parseRunner,
  parseRunnerAccountRegistration,
} from "../schemas/runnerSchema";

type BodyParser = (body: unknown) => unknown;

const validateBody = (parser: BodyParser) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validatedBody = parser(req.body);
      return next();
    } catch (err) {
      return next(err);
    }
  };
};

export const validateOrganizerRegistration = validateBody(parseOrganizerRegistration);

export const validateLogin = validateBody(parseLogin);

export const validateCompetition = validateBody(parseCompetition);

export const validateRunner = validateBody(parseRunner);

export const validateRunnerAccountRegistration = validateBody(parseRunnerAccountRegistration);
