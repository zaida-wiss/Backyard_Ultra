import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import HttpError from "../errors/httpError.js";
import { CompetitionModel, toCompetitionResponse } from "../models/competition.model.js";
import { RunnerModel, type RunnerDocument, toRunnerResponse } from "../models/runner.model.js";
import {
  hasRole,
  toOrganizerAccount,
  toPublicUser,
  toRunnerAccount,
  UserModel,
} from "../models/user.model.js";
import type { LoginBody } from "../schemas/organizerSchema.js";
import type {
  RunnerAccountRegistrationBody,
  ValidatedRunnerBody,
} from "../schemas/runnerSchema.js";
import { createToken, hashPassword, verifyPassword } from "../utils/jwt.js";
import { getCompetitionOrThrow, requireCompetitionOwner } from "./competitionsController.js";

const getRouteParam = (value: string | string[]) => {
  return Array.isArray(value) ? value[0] : value;
};

const toObjectIdOrThrow = (id: string, code: string, message: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new HttpError(404, code, message);
  }

  return new Types.ObjectId(id);
};

const getRunnerOrThrow = async (id: string): Promise<RunnerDocument> => {
  const runner = await RunnerModel.findOne({
    _id: toObjectIdOrThrow(id, "RUNNER_NOT_FOUND", "Löparen finns inte"),
    deletedAt: null,
  });

  if (!runner) {
    throw new HttpError(404, "RUNNER_NOT_FOUND", `Ingen löpare med id ${id} hittades`);
  }

  return runner;
};

const listRunners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: Record<string, unknown> = { deletedAt: null };
    const competitionId = req.query.competitionId ? String(req.query.competitionId) : null;
    const status = req.query.status ? String(req.query.status).toLowerCase() : null;

    if (competitionId) {
      query.competitionId = toObjectIdOrThrow(
        competitionId,
        "COMPETITION_NOT_FOUND",
        "Tävlingen finns inte",
      );
    }

    if (status) {
      query.status = status;
    }

    const runners = await RunnerModel.find(query).sort({ createdAt: 1 });

    return res.json(runners.map(toRunnerResponse));
  } catch (error) {
    return next(error);
  }
};

const listCompetitionRunners = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const competition = await getCompetitionOrThrow(getRouteParam(req.params.competitionId));
    const runners = await RunnerModel.find({
      competitionId: competition._id,
      deletedAt: null,
    }).sort({ createdAt: 1 });

    return res.json(runners.map(toRunnerResponse));
  } catch (error) {
    return next(error);
  }
};

const getRunnerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const runner = await getRunnerOrThrow(getRouteParam(req.params.id));

    return res.json(toRunnerResponse(runner));
  } catch (error) {
    return next(error);
  }
};

const registerRunnerAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { firstName, lastName, email, password, club } = req.validatedBody as RunnerAccountRegistrationBody;
    const existingRunner = await UserModel.findOne({ email });

    if (existingRunner) {
      throw new HttpError(409, "EMAIL_ALREADY_EXISTS", "Ett löparkonto med den e-posten finns redan");
    }

    const runnerAccount = await UserModel.create({
      firstName,
      lastName,
      email,
      club,
      roles: ["user", "runner"],
      passwordHash: await hashPassword(password),
    });

    return res.status(201).json({
      user: toPublicUser(runnerAccount),
      runner: toRunnerAccount(runnerAccount),
      organizer: null,
      token: createToken({ id: runnerAccount.id, email: runnerAccount.email }, runnerAccount.roles),
    });
  } catch (error) {
    return next(error);
  }
};

const loginRunner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.validatedBody as LoginBody;
    const runnerAccount = await UserModel.findOne({ email });

    if (!runnerAccount || !(await verifyPassword(password, runnerAccount.passwordHash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Fel email eller lösenord");
    }

    return res.json({
      user: toPublicUser(runnerAccount),
      runner: toRunnerAccount(runnerAccount),
      organizer: hasRole(runnerAccount, "organizer") || hasRole(runnerAccount, "admin")
        ? toOrganizerAccount(runnerAccount)
        : null,
      token: createToken({ id: runnerAccount.id, email: runnerAccount.email }, runnerAccount.roles),
    });
  } catch (error) {
    return next(error);
  }
};

const getCurrentRunner = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.runnerAccount) {
    return next(new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som löpare"));
  }

  return res.json({
    runner: req.runnerAccount,
  });
};

const registerRunner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const competition = await getCompetitionOrThrow(getRouteParam(req.params.competitionId));
    const validatedBody = req.validatedBody as ValidatedRunnerBody;

    requireCompetitionOwner(competition, req.organizer.id, req.organizer.role);

    const runner = await RunnerModel.create({
      competitionId: competition._id,
      firstName: validatedBody.firstName,
      lastName: validatedBody.lastName,
      email: validatedBody.email,
      club: validatedBody.club,
    });

    return res.status(201).json(toRunnerResponse(runner));
  } catch (error) {
    return next(error);
  }
};

const registerCurrentRunnerForCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.runnerAccount) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som löpare");
    }

    const competition = await getCompetitionOrThrow(getRouteParam(req.params.competitionId));
    const existingRegistration = await RunnerModel.findOne({
      competitionId: competition._id,
      runnerAccountId: req.runnerAccount.id,
      deletedAt: null,
    });

    if (existingRegistration) {
      throw new HttpError(409, "RUNNER_ALREADY_REGISTERED", "Du är redan anmäld till tävlingen");
    }

    const registration = await RunnerModel.create({
      competitionId: competition._id,
      runnerAccountId: req.runnerAccount.id,
      firstName: req.runnerAccount.firstName,
      lastName: req.runnerAccount.lastName,
      email: req.runnerAccount.email,
      club: req.runnerAccount.club,
    });

    return res.status(201).json(toRunnerResponse(registration));
  } catch (error) {
    return next(error);
  }
};

const listCurrentRunnerRegistrations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.runnerAccount) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som löpare");
    }

    const registrations = await RunnerModel.find({
      runnerAccountId: req.runnerAccount.id,
      deletedAt: null,
    }).sort({ createdAt: 1 });

    const competitionIds = registrations.map((registration) => registration.competitionId);
    const competitions = await CompetitionModel.find({ _id: { $in: competitionIds } });
    const competitionsById = new Map(
      competitions.map((competition) => [competition.id, toCompetitionResponse(competition)]),
    );

    return res.json(
      registrations.map((registration) => ({
        ...toRunnerResponse(registration),
        competition: competitionsById.get(registration.competitionId.toString()) ?? null,
      })),
    );
  } catch (error) {
    return next(error);
  }
};

const updateRunner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const runner = await getRunnerOrThrow(getRouteParam(req.params.id));
    const competition = await getCompetitionOrThrow(runner.competitionId.toString());
    const validatedBody = req.validatedBody as ValidatedRunnerBody;

    requireCompetitionOwner(competition, req.organizer.id, req.organizer.role);

    runner.firstName = validatedBody.firstName;
    runner.lastName = validatedBody.lastName;
    runner.email = validatedBody.email || null;
    runner.club = validatedBody.club || null;

    await runner.save();

    return res.json(toRunnerResponse(runner));
  } catch (error) {
    return next(error);
  }
};

const deleteRunner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const runner = await getRunnerOrThrow(getRouteParam(req.params.id));
    const competition = await getCompetitionOrThrow(runner.competitionId.toString());

    requireCompetitionOwner(competition, req.organizer.id, req.organizer.role);

    runner.deletedAt = new Date();
    await runner.save();

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export {
  deleteRunner,
  getCurrentRunner,
  getRunnerById,
  listCompetitionRunners,
  listCurrentRunnerRegistrations,
  listRunners,
  loginRunner,
  registerCurrentRunnerForCompetition,
  registerRunner,
  registerRunnerAccount,
  updateRunner,
};
