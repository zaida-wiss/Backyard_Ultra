import type { NextFunction, Request, Response } from "express";
import { competitions, runners } from "../data/store";
import { createCompetition } from "../models/competition";
import { filterCompetitions, parseCompetitionFilters } from "../services/competitionFilters";
import type { Competition, CreateCompetitionInput } from "../types/domain";
import HttpError from "../utils/httpError";

type ValidatedCompetitionBody = Omit<CreateCompetitionInput, "organizerId">;

export const getCompetitionOrThrow = (id: number): Competition => {
  const competition = competitions.find((currentCompetition) => currentCompetition.id === id);

  if (!competition) {
    throw new HttpError(404, 'COMPETITION_NOT_FOUND', `Ingen tävling med id ${id} hittades`);
  }

  return competition;
};

export const requireCompetitionOwner = (competition: Competition | undefined, organizerId: number) => {
  if (!competition) {
    throw new HttpError(404, 'COMPETITION_NOT_FOUND', 'Tävlingen finns inte');
  }

  if (competition.organizerId !== organizerId) {
    throw new HttpError(403, 'FORBIDDEN', 'Du kan bara ändra dina egna tävlingar');
  }
};

export const listCompetitions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = parseCompetitionFilters(req.query as Record<string, unknown>);
    return res.json(filterCompetitions(competitions, filters));
  } catch (err) {
    return next(err);
  }
};

export const getCompetitionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const competition = getCompetitionOrThrow(id);
    const registeredRunners = runners.filter((runner) => runner.competitionId === id);

    return res.json({
      ...competition,
      runnersCount: registeredRunners.length,
    });
  } catch (err) {
    return next(err);
  }
};

export const createCompetitionForOrganizer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.organizer) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad som arrangör'));
  }

  const validatedBody = req.validatedBody as ValidatedCompetitionBody;
  const competition = createCompetition({
    organizerId: req.organizer.id,
    ...validatedBody,
  });

  competitions.push(competition);

  return res.status(201).json(competition);
};

export const updateCompetition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad som arrangör');
    }

    const id = Number(req.params.id);
    const competition = getCompetitionOrThrow(id);
    const validatedBody = req.validatedBody as ValidatedCompetitionBody;

    requireCompetitionOwner(competition, req.organizer.id);

    competition.name = validatedBody.name;
    competition.type = validatedBody.type;
    competition.place = validatedBody.place;
    competition.startAt = validatedBody.startAt;
    competition.endAt = validatedBody.endAt;
    competition.updatedAt = new Date().toISOString();

    return res.json(competition);
  } catch (err) {
    return next(err);
  }
};

export const deleteCompetition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad som arrangör');
    }

    const id = Number(req.params.id);
    const competition = getCompetitionOrThrow(id);

    requireCompetitionOwner(competition, req.organizer.id);

    const competitionIndex = competitions.findIndex((currentCompetition) => currentCompetition.id === id);
    competitions.splice(competitionIndex, 1);

    for (let index = runners.length - 1; index >= 0; index -= 1) {
      if (runners[index].competitionId === id) {
        runners.splice(index, 1);
      }
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};
