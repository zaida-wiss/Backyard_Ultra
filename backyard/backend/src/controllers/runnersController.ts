import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import HttpError from "../errors/httpError";
import { CompetitionModel, toCompetitionResponse } from "../models/competition.model";
import { RunnerModel, type RunnerDocument, toRunnerResponse } from "../models/runner.model";
import {
  RunnerAccountModel,
  toPublicRunnerAccount,
} from "../models/runnerAccount.model";
import type { LoginBody } from "../schemas/organizerSchema";
import type {
  RunnerAccountRegistrationBody,
  ValidatedRunnerBody,
} from "../schemas/runnerSchema";
import { createToken, hashPassword, verifyPassword } from "../utils/security";
import { getCompetitionOrThrow, requireCompetitionOwner } from "./competitionsController";

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
  const runner = await RunnerModel.findById(
    toObjectIdOrThrow(id, "RUNNER_NOT_FOUND", "Löparen finns inte"),
  );

  if (!runner) {
    throw new HttpError(404, "RUNNER_NOT_FOUND", `Ingen löpare med id ${id} hittades`);
  }

  return runner;
};

export const listRunners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: Record<string, unknown> = {};
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

export const listCompetitionRunners = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const competition = await getCompetitionOrThrow(getRouteParam(req.params.competitionId));
    const runners = await RunnerModel.find({ competitionId: competition._id }).sort({ createdAt: 1 });

    return res.json(runners.map(toRunnerResponse));
  } catch (error) {
    return next(error);
  }
};

export const getRunnerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const runner = await getRunnerOrThrow(getRouteParam(req.params.id));

    return res.json(toRunnerResponse(runner));
  } catch (error) {
    return next(error);
  }
};

export const registerRunnerAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { firstName, lastName, email, password, club } = req.validatedBody as RunnerAccountRegistrationBody;
    const existingRunner = await RunnerAccountModel.findOne({ email });

    if (existingRunner) {
      throw new HttpError(409, "EMAIL_ALREADY_EXISTS", "Ett löparkonto med den e-posten finns redan");
    }

    const runnerAccount = await RunnerAccountModel.create({
      firstName,
      lastName,
      email,
      club,
      passwordHash: await hashPassword(password),
    });

    return res.status(201).json({
      runner: toPublicRunnerAccount(runnerAccount),
      token: createToken({ id: runnerAccount.id, email: runnerAccount.email }, "runner"),
    });
  } catch (error) {
    return next(error);
  }
};

export const loginRunner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.validatedBody as LoginBody;
    const runnerAccount = await RunnerAccountModel.findOne({ email });

    if (!runnerAccount || !(await verifyPassword(password, runnerAccount.passwordHash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Fel email eller lösenord");
    }

    return res.json({
      runner: toPublicRunnerAccount(runnerAccount),
      token: createToken({ id: runnerAccount.id, email: runnerAccount.email }, "runner"),
    });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentRunner = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.runnerAccount) {
    return next(new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som löpare"));
  }

  return res.json({
    runner: req.runnerAccount,
  });
};

export const registerRunner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const competition = await getCompetitionOrThrow(getRouteParam(req.params.competitionId));
    const validatedBody = req.validatedBody as ValidatedRunnerBody;

    requireCompetitionOwner(competition, req.organizer.id);

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

export const registerCurrentRunnerForCompetition = async (
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

export const listCurrentRunnerRegistrations = async (
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

export const updateRunner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const runner = await getRunnerOrThrow(getRouteParam(req.params.id));
    const competition = await getCompetitionOrThrow(runner.competitionId.toString());
    const validatedBody = req.validatedBody as ValidatedRunnerBody;

    requireCompetitionOwner(competition, req.organizer.id);

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

export const deleteRunner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const runner = await getRunnerOrThrow(getRouteParam(req.params.id));
    const competition = await getCompetitionOrThrow(runner.competitionId.toString());

    requireCompetitionOwner(competition, req.organizer.id);

    await runner.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
