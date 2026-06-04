import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import HttpError from "../errors/httpError.js";
import { CompetitionModel, toCompetitionResponse } from "../models/competition.model.js";
import type { CompetitionDocument } from "../models/competition.model.js";
import {
  ResultChangeLogModel,
  toResultChangeLogResponse,
} from "../models/resultChangeLog.model.js";
import { RunnerModel, type RunnerDocument, toRunnerResponse } from "../models/runner.model.js";
import { TimekeeperAssignmentModel } from "../models/timekeeperAssignment.model.js";
import {
  hasRole,
  toOrganizerAccount,
  toPublicUser,
  toRunnerAccount,
  UserModel,
} from "../models/user.model.js";
import type { LoginBody } from "../schemas/organizerSchema.js";
import type {
  RunnerLapTimesBody,
  RunnerAccountRegistrationBody,
  ValidatedRunnerBody,
} from "../schemas/runnerSchema.js";
import {
  cancelAccountDeletion,
  finalizeAccountDeletion,
  isAccountDeletionDue,
} from "../services/accountDeletion.js";
import { setAuthCookie } from "../utils/authCookie.js";
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

const isPastDeadline = (deadline: Date | null | undefined) => {
  return Boolean(deadline && deadline.getTime() < Date.now());
};

const requireSelfRegistrationAllowed = (competition: CompetitionDocument) => {
  if (competition.registrationMode === "organizer_only") {
    throw new HttpError(
      403,
      "SELF_REGISTRATION_CLOSED",
      "Deltagare kan inte anmäla sig själva till den här tävlingen",
    );
  }

  if (competition.status !== "open") {
    throw new HttpError(
      403,
      "REGISTRATION_CLOSED",
      "Anmälan är inte öppen för den här tävlingen",
    );
  }

  if (isPastDeadline(competition.registrationDeadline)) {
    throw new HttpError(
      403,
      "REGISTRATION_DEADLINE_PASSED",
      "Sista anmälningsdag har passerat",
    );
  }
};

const validateRegistrationSettings = (
  competition: CompetitionDocument,
  runner: ValidatedRunnerBody,
) => {
  if (runner.registrationType === "team" && !competition.allowTeamRegistration) {
    throw new HttpError(
      400,
      "TEAM_REGISTRATION_NOT_ALLOWED",
      "Tävlingen tillåter inte laganmälan",
    );
  }

  if (runner.club && !competition.allowRepresentingOrganization) {
    throw new HttpError(
      400,
      "REPRESENTING_ORGANIZATION_NOT_ALLOWED",
      "Tävlingen tillåter inte klubb, förening, företag eller organisation",
    );
  }
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

    const runners = await RunnerModel.find(query).sort({ runnerNumber: 1, createdAt: 1 });

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
    }).sort({ runnerNumber: 1, createdAt: 1 });

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

    const token = createToken({ id: runnerAccount.id, email: runnerAccount.email }, runnerAccount.roles);

    setAuthCookie(res, token);

    return res.status(201).json({
      user: toPublicUser(runnerAccount),
      runner: toRunnerAccount(runnerAccount),
      organizer: null,
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

    if (isAccountDeletionDue(runnerAccount)) {
      await finalizeAccountDeletion(runnerAccount);
      throw new HttpError(410, "ACCOUNT_DELETED", "Kontot har raderats efter ångerperioden");
    }

    if (cancelAccountDeletion(runnerAccount)) {
      await runnerAccount.save();
    }

    const token = createToken({ id: runnerAccount.id, email: runnerAccount.email }, runnerAccount.roles);

    setAuthCookie(res, token);

    return res.json({
      user: toPublicUser(runnerAccount),
      runner: toRunnerAccount(runnerAccount),
      organizer: hasRole(runnerAccount, "organizer") || hasRole(runnerAccount, "admin")
        ? toOrganizerAccount(runnerAccount)
        : null,
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
    validateRegistrationSettings(competition, validatedBody);

    const runner = await RunnerModel.create({
      competitionId: competition._id,
      runnerNumber: validatedBody.runnerNumber ?? null,
      registrationType: validatedBody.registrationType ?? "individual",
      teamName: validatedBody.teamName ?? null,
      teamMembers: validatedBody.teamMembers ?? [],
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
    requireSelfRegistrationAllowed(competition);

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
      registrationType: "individual",
      firstName: req.runnerAccount.firstName,
      lastName: req.runnerAccount.lastName,
      email: req.runnerAccount.email,
      club: competition.allowRepresentingOrganization ? req.runnerAccount.club : null,
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
    validateRegistrationSettings(competition, validatedBody);

    runner.runnerNumber = validatedBody.runnerNumber ?? null;
    runner.registrationType = validatedBody.registrationType ?? "individual";
    runner.teamName = validatedBody.teamName || null;
    runner.set("teamMembers", validatedBody.teamMembers ?? []);
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

const updateRunnerLapTimes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad");
    }

    const runner = await getRunnerOrThrow(getRouteParam(req.params.id));
    const competition = await getCompetitionOrThrow(runner.competitionId.toString());
    const { lapTimes, status, isManualCorrection, changeReason } = req.validatedBody as RunnerLapTimesBody;
    const roles = req.authUser?.roles ?? [];
    const isAdmin = roles.includes("admin");
    const isOrganizer = roles.includes("organizer");
    const isAssignedTimekeeper = roles.includes("timekeeper")
      ? await TimekeeperAssignmentModel.exists({
          competitionId: competition._id,
          userId: req.authUser?.id,
        })
      : null;

    if (!isAdmin && !isAssignedTimekeeper) {
      if (!req.organizer) {
        throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som tidtagare eller arrangör");
      }

      if (!isOrganizer) {
        throw new HttpError(403, "FORBIDDEN", "Du saknar behörighet för tidtagning på den här tävlingen");
      }

      requireCompetitionOwner(competition, req.organizer.id, req.organizer.role);
    }

    const previousValue = {
      lapTimes: runner.lapTimes,
      status: runner.status,
    };

    runner.lapTimes = lapTimes;
    if (status) {
      runner.status = status;
    }
    await runner.save();

    await ResultChangeLogModel.create({
      competitionId: competition._id,
      runnerId: runner._id,
      actorUserId: req.authUser.id,
      actorRoles: roles,
      lapNumber: lapTimes.length || null,
      changeType: isManualCorrection
        ? "manual_correction"
        : status === "dnf"
          ? "dnf_registered"
          : "lap_times_updated",
      previousValue,
      newValue: {
        lapTimes: runner.lapTimes,
        status: runner.status,
      },
      reason: changeReason,
    });

    return res.json(toRunnerResponse(runner));
  } catch (error) {
    return next(error);
  }
};

const listRunnerResultChangeLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const runner = await getRunnerOrThrow(getRouteParam(req.params.id));
    const competition = await getCompetitionOrThrow(runner.competitionId.toString());

    requireCompetitionOwner(competition, req.organizer.id, req.organizer.role);

    const logs = await ResultChangeLogModel.find({
      competitionId: competition._id,
      runnerId: runner._id,
    }).sort({ createdAt: -1 });

    return res.json(logs.map(toResultChangeLogResponse));
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
  listRunnerResultChangeLogs,
  listRunners,
  loginRunner,
  registerCurrentRunnerForCompetition,
  registerRunner,
  registerRunnerAccount,
  updateRunnerLapTimes,
  updateRunner,
};
