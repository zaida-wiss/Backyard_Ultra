import type { NextFunction, Request, Response } from "express";
import {
  parseLogin,
  parseOrganizerRegistration,
} from "../schemas/organizerSchema.js";
import { parseCompetition } from "../schemas/competitionSchema.js";
import {
  parseRunner,
  parseRunnerAccountRegistration,
} from "../schemas/runnerSchema.js";
import { parseObjectIdParams } from "../schemas/paramSchema.js";

type BodyParser = (body: unknown) => unknown;
type ParamsParser = (params: Record<string, unknown>) => unknown;

const validateBody = (parser: BodyParser) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Parsern returnerar en tryggare version av body. Controllern slipper läsa rå req.body.
      req.validatedBody = parser(req.body);
      return next();
    } catch (err) {
      return next(err);
    }
  };
};

const validateParams = (parser: ParamsParser) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Params kommer alltid som text från URL:en, men parsern kontrollerar att formatet är rätt.
      req.params = parser(req.params) as Record<string, string>;
      return next();
    } catch (err) {
      return next(err);
    }
  };
};

// Vanlig route-param: /:id
const validateIdParam = validateParams((params) => parseObjectIdParams(params, ["id"]));

// Tävlingens runner-routes använder /:competitionId/runners i stället för /:id.
const validateCompetitionIdParam = validateParams((params) => {
  return parseObjectIdParams(params, ["competitionId"]);
});

const validateOrganizerRegistration = validateBody(parseOrganizerRegistration);

const validateLogin = validateBody(parseLogin);

const validateCompetition = validateBody(parseCompetition);

const validateRunner = validateBody(parseRunner);

const validateRunnerAccountRegistration = validateBody(parseRunnerAccountRegistration);

export {
  validateCompetition,
  validateCompetitionIdParam,
  validateIdParam,
  validateLogin,
  validateOrganizerRegistration,
  validateRunner,
  validateRunnerAccountRegistration,
};
