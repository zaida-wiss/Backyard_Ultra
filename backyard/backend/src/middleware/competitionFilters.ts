import type { NextFunction, Request, Response } from "express";
import { parseCompetitionFilters } from "../schemas/competitionFiltersSchema";

export const parseCompetitionFiltersHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    req.competitionFilters = parseCompetitionFilters(req.query as Record<string, unknown>);
    return next();
  } catch (err) {
    return next(err);
  }
};
