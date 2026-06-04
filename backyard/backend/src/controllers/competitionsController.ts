import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import HttpError from "../errors/httpError.js";
import {
  CompetitionModel,
  type CompetitionDocument,
  toCompetitionResponse,
} from "../models/competition.model.js";
import { RunnerModel } from "../models/runner.model.js";
import type { ValidatedCompetitionBody } from "../schemas/competitionSchema.js";
import { parsePagination } from "../schemas/paginationSchema.js";
import { buildCompetitionQuery } from "../services/competitionQuery.js";
import type { AuthRole } from "../types/domain.js";

const toDatabaseDate = (dateTimeLocal: string) => new Date(`${dateTimeLocal}:00.000Z`);
const toOptionalDatabaseDate = (dateTimeLocal: string | null) => {
  return dateTimeLocal ? toDatabaseDate(dateTimeLocal) : null;
};

const getRouteParam = (value: string | string[]) => {
  return Array.isArray(value) ? value[0] : value;
};

const toObjectIdOrThrow = (id: string, message: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new HttpError(404, "NOT_FOUND", message);
  }

  return new Types.ObjectId(id);
};

const getCompetitionOrThrow = async (id: string): Promise<CompetitionDocument> => {
  const competition = await CompetitionModel.findById(
    toObjectIdOrThrow(id, "Tävlingen finns inte"),
  );

  if (!competition) {
    throw new HttpError(404, "COMPETITION_NOT_FOUND", `Ingen tävling med id ${id} hittades`);
  }

  return competition;
};

const requireCompetitionOwner = (
  competition: CompetitionDocument,
  organizerId: string,
  role: AuthRole = "organizer",
) => {
  if (role === "admin") {
    return;
  }

  if (competition.organizerId.toString() !== organizerId) {
    throw new HttpError(403, "FORBIDDEN", "Du kan bara ändra dina egna tävlingar");
  }
};

const listCompetitions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.competitionFilters) {
      throw new HttpError(500, "FILTERS_NOT_PARSED", "Tävlingsfilter saknas");
    }

    const { page, limit } = parsePagination(req.query);
    const competitions = await CompetitionModel.find({
      ...buildCompetitionQuery(req.competitionFilters),
      isPublic: true,
    })
      .sort({ startAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json(competitions.map(toCompetitionResponse));
  } catch (error) {
    return next(error);
  }
};

const getCompetitionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const competition = await getCompetitionOrThrow(getRouteParam(req.params.id));
    const runnersCount = await RunnerModel.countDocuments({
      competitionId: competition._id,
      deletedAt: null,
    });

    return res.json({
      ...toCompetitionResponse(competition),
      runnersCount,
    });
  } catch (error) {
    return next(error);
  }
};

const createCompetitionForOrganizer = async (
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
      templateKey: validatedBody.templateKey,
      status: validatedBody.status,
      place: validatedBody.place,
      startAt: toDatabaseDate(validatedBody.startAt),
      endAt: toOptionalDatabaseDate(validatedBody.endAt),
      registrationDeadline: toOptionalDatabaseDate(validatedBody.registrationDeadline),
      isPublic: validatedBody.isPublic,
      registrationMode: validatedBody.registrationMode,
      allowTeamRegistration: validatedBody.allowTeamRegistration,
      allowRepresentingOrganization: validatedBody.allowRepresentingOrganization,
    });

    return res.status(201).json(toCompetitionResponse(competition));
  } catch (error) {
    return next(error);
  }
};

const updateCompetition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const competition = await getCompetitionOrThrow(getRouteParam(req.params.id));
    const validatedBody = req.validatedBody as ValidatedCompetitionBody;

    requireCompetitionOwner(competition, req.organizer.id, req.organizer.role);

    competition.name = validatedBody.name;
    competition.type = validatedBody.type;
    competition.templateKey = validatedBody.templateKey;
    competition.status = validatedBody.status;
    competition.place = validatedBody.place;
    competition.startAt = toDatabaseDate(validatedBody.startAt);
    competition.endAt = toOptionalDatabaseDate(validatedBody.endAt);
    competition.registrationDeadline = toOptionalDatabaseDate(validatedBody.registrationDeadline);
    competition.isPublic = validatedBody.isPublic;
    competition.registrationMode = validatedBody.registrationMode;
    competition.allowTeamRegistration = validatedBody.allowTeamRegistration;
    competition.allowRepresentingOrganization = validatedBody.allowRepresentingOrganization;

    await competition.save();

    return res.json(toCompetitionResponse(competition));
  } catch (error) {
    return next(error);
  }
};

const deleteCompetition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const competition = await getCompetitionOrThrow(getRouteParam(req.params.id));

    requireCompetitionOwner(competition, req.organizer.id, req.organizer.role);

    await RunnerModel.deleteMany({ competitionId: competition._id });
    await competition.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export {
  createCompetitionForOrganizer,
  deleteCompetition,
  getCompetitionById,
  getCompetitionOrThrow,
  listCompetitions,
  requireCompetitionOwner,
  updateCompetition,
};
