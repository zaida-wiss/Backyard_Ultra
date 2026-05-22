import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import HttpError from "../errors/httpError";
import {
  CompetitionModel,
  type CompetitionDocument,
  toCompetitionResponse,
} from "../models/competition.model";
import { RunnerModel } from "../models/runner.model";
import type { ValidatedCompetitionBody } from "../schemas/competitionSchema";
import { buildCompetitionQuery } from "../services/competitionQuery";

const toDatabaseDate = (dateTimeLocal: string) => new Date(`${dateTimeLocal}:00.000Z`);

const getRouteParam = (value: string | string[]) => {
  return Array.isArray(value) ? value[0] : value;
};

const toObjectIdOrThrow = (id: string, message: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new HttpError(404, "NOT_FOUND", message);
  }

  return new Types.ObjectId(id);
};

export const getCompetitionOrThrow = async (id: string): Promise<CompetitionDocument> => {
  const competition = await CompetitionModel.findById(
    toObjectIdOrThrow(id, "Tävlingen finns inte"),
  );

  if (!competition) {
    throw new HttpError(404, "COMPETITION_NOT_FOUND", `Ingen tävling med id ${id} hittades`);
  }

  return competition;
};

export const requireCompetitionOwner = (
  competition: CompetitionDocument,
  organizerId: string,
) => {
  if (competition.organizerId.toString() !== organizerId) {
    throw new HttpError(403, "FORBIDDEN", "Du kan bara ändra dina egna tävlingar");
  }
};

export const listCompetitions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.competitionFilters) {
      throw new HttpError(500, "FILTERS_NOT_PARSED", "Tävlingsfilter saknas");
    }

    const competitions = await CompetitionModel.find(
      buildCompetitionQuery(req.competitionFilters),
    ).sort({ startAt: 1 });

    return res.json(competitions.map(toCompetitionResponse));
  } catch (error) {
    return next(error);
  }
};

export const getCompetitionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const competition = await getCompetitionOrThrow(getRouteParam(req.params.id));
    const runnersCount = await RunnerModel.countDocuments({ competitionId: competition._id });

    return res.json({
      ...toCompetitionResponse(competition),
      runnersCount,
    });
  } catch (error) {
    return next(error);
  }
};

export const createCompetitionForOrganizer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const validatedBody = req.validatedBody as ValidatedCompetitionBody;
    const competition = await CompetitionModel.create({
      organizerId: req.organizer.id,
      name: validatedBody.name,
      type: validatedBody.type,
      place: validatedBody.place,
      startAt: toDatabaseDate(validatedBody.startAt),
      endAt: toDatabaseDate(validatedBody.endAt),
    });

    return res.status(201).json(toCompetitionResponse(competition));
  } catch (error) {
    return next(error);
  }
};

export const updateCompetition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const competition = await getCompetitionOrThrow(getRouteParam(req.params.id));
    const validatedBody = req.validatedBody as ValidatedCompetitionBody;

    requireCompetitionOwner(competition, req.organizer.id);

    competition.name = validatedBody.name;
    competition.type = validatedBody.type;
    competition.place = validatedBody.place;
    competition.startAt = toDatabaseDate(validatedBody.startAt);
    competition.endAt = toDatabaseDate(validatedBody.endAt);

    await competition.save();

    return res.json(toCompetitionResponse(competition));
  } catch (error) {
    return next(error);
  }
};

export const deleteCompetition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const competition = await getCompetitionOrThrow(getRouteParam(req.params.id));

    requireCompetitionOwner(competition, req.organizer.id);

    await RunnerModel.deleteMany({ competitionId: competition._id });
    await competition.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
