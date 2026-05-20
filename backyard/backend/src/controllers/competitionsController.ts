import type { NextFunction, Request, Response } from "express";
import { competitions, runners } from "../data/store";
import { createCompetition } from "../models/competition";
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
    const organizerId = req.query.organizerId ? Number(req.query.organizerId) : null;
    const type = req.query.type ? String(req.query.type).toLowerCase() : null;
    const place = req.query.place ? String(req.query.place).toLowerCase() : null;
    const date = req.query.date ? String(req.query.date) : null;
    const startsAfter = req.query.startsAfter ? String(req.query.startsAfter) : null;
    const endsBefore = req.query.endsBefore ? String(req.query.endsBefore) : null;

    if (req.query.organizerId && Number.isNaN(organizerId)) {
      throw new HttpError(400, 'BAD_REQUEST', 'organizerId måste vara ett tal');
    }

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new HttpError(400, 'BAD_REQUEST', 'date måste skrivas som YYYY-MM-DD');
    }

    if (startsAfter && Number.isNaN(Date.parse(startsAfter))) {
      throw new HttpError(400, 'BAD_REQUEST', 'startsAfter måste vara ett giltigt datum');
    }

    if (endsBefore && Number.isNaN(Date.parse(endsBefore))) {
      throw new HttpError(400, 'BAD_REQUEST', 'endsBefore måste vara ett giltigt datum');
    }

    let result = competitions;

    if (organizerId) {
      result = result.filter((competition) => competition.organizerId === organizerId);
    }

    if (type) {
      result = result.filter((competition) => competition.type.toLowerCase().includes(type));
    }

    if (place) {
      result = result.filter((competition) => competition.place.toLowerCase().includes(place));
    }

    if (date) {
      result = result.filter((competition) => (
        competition.startAt.slice(0, 10) <= date && competition.endAt.slice(0, 10) >= date
      ));
    }

    if (startsAfter) {
      result = result.filter((competition) => Date.parse(competition.startAt) >= Date.parse(startsAfter));
    }

    if (endsBefore) {
      result = result.filter((competition) => Date.parse(competition.endAt) <= Date.parse(endsBefore));
    }

    return res.json(result);
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
