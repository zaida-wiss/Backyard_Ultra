import type { NextFunction, Request, Response } from "express";
import { competitions, runnerAccounts, runners } from "../data/store";
import { createRunnerAccount, toPublicRunnerAccount } from "../models/runnerAccount";
import { createRunner } from "../models/runner";
import type { CreateRunnerAccountInput, CreateRunnerInput } from "../types/domain";
import HttpError from "../utils/httpError";
import { createToken, hashPassword, verifyPassword } from "../utils/security";
import { getCompetitionOrThrow, requireCompetitionOwner } from "./competitionsController";

type ValidatedRunnerBody = Omit<CreateRunnerInput, "competitionId">;
type RegisterRunnerAccountBody = Omit<CreateRunnerAccountInput, "passwordHash"> & {
  password: string;
};
type LoginRunnerBody = {
  email: string;
  password: string;
};

export const listRunners = async (req: Request, res: Response) => {
  const competitionId = req.query.competitionId ? Number(req.query.competitionId) : null;
  const status = req.query.status ? String(req.query.status).toLowerCase() : null;

  let result = runners;

  if (competitionId) {
    result = result.filter((runner) => runner.competitionId === competitionId);
  }

  if (status) {
    result = result.filter((runner) => runner.status.toLowerCase() === status);
  }

  res.json(result);
};

export const listCompetitionRunners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const competitionId = Number(req.params.competitionId);
    getCompetitionOrThrow(competitionId);

    return res.json(runners.filter((runner) => runner.competitionId === competitionId));
  } catch (err) {
    return next(err);
  }
};

export const getRunnerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const runner = runners.find((currentRunner) => currentRunner.id === id);

    if (!runner) {
      throw new HttpError(404, 'RUNNER_NOT_FOUND', `Ingen löpare med id ${id} hittades`);
    }

    return res.json(runner);
  } catch (err) {
    return next(err);
  }
};

export const registerRunnerAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, club } = req.validatedBody as RegisterRunnerAccountBody;
    const existingRunner = runnerAccounts.find((runnerAccount) => runnerAccount.email === email);

    if (existingRunner) {
      throw new HttpError(409, 'EMAIL_ALREADY_EXISTS', 'Ett löparkonto med den e-posten finns redan');
    }

    const runnerAccount = createRunnerAccount({
      firstName,
      lastName,
      email,
      club,
      passwordHash: hashPassword(password),
    });

    runnerAccounts.push(runnerAccount);

    return res.status(201).json({
      runner: toPublicRunnerAccount(runnerAccount),
      token: createToken(runnerAccount, "runner"),
    });
  } catch (err) {
    return next(err);
  }
};

export const loginRunner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.validatedBody as LoginRunnerBody;
    const runnerAccount = runnerAccounts.find((currentRunner) => currentRunner.email === email);

    if (!runnerAccount || !verifyPassword(password, runnerAccount.passwordHash)) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Fel email eller lösenord');
    }

    return res.json({
      runner: toPublicRunnerAccount(runnerAccount),
      token: createToken(runnerAccount, "runner"),
    });
  } catch (err) {
    return next(err);
  }
};

export const getCurrentRunner = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.runnerAccount) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad som löpare'));
  }

  return res.json({
    runner: toPublicRunnerAccount(req.runnerAccount),
  });
};

export const registerRunner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad som arrangör');
    }

    const competitionId = Number(req.params.competitionId);
    const competition = getCompetitionOrThrow(competitionId);
    const validatedBody = req.validatedBody as ValidatedRunnerBody;

    requireCompetitionOwner(competition, req.organizer.id);

    const runner = createRunner({
      competitionId,
      ...validatedBody,
    });

    runners.push(runner);

    return res.status(201).json(runner);
  } catch (err) {
    return next(err);
  }
};

export const registerCurrentRunnerForCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.runnerAccount) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad som löpare');
    }

    const competitionId = Number(req.params.competitionId);
    getCompetitionOrThrow(competitionId);

    const existingRegistration = runners.find((runner) => (
      runner.competitionId === competitionId && runner.runnerAccountId === req.runnerAccount?.id
    ));

    if (existingRegistration) {
      throw new HttpError(409, 'RUNNER_ALREADY_REGISTERED', 'Du är redan anmäld till tävlingen');
    }

    const registration = createRunner({
      competitionId,
      runnerAccountId: req.runnerAccount.id,
      firstName: req.runnerAccount.firstName,
      lastName: req.runnerAccount.lastName,
      email: req.runnerAccount.email,
      club: req.runnerAccount.club,
    });

    runners.push(registration);

    return res.status(201).json(registration);
  } catch (err) {
    return next(err);
  }
};

export const listCurrentRunnerRegistrations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.runnerAccount) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad som löpare');
    }

    const registrations = runners
      .filter((runner) => runner.runnerAccountId === req.runnerAccount?.id)
      .map((registration) => {
        const competition = competitions.find((currentCompetition) => (
          currentCompetition.id === registration.competitionId
        ));

        return {
          ...registration,
          competition,
        };
      });

    return res.json(registrations);
  } catch (err) {
    return next(err);
  }
};

export const updateRunner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad som arrangör');
    }

    const id = Number(req.params.id);
    const runner = runners.find((currentRunner) => currentRunner.id === id);
    const validatedBody = req.validatedBody as ValidatedRunnerBody;

    if (!runner) {
      throw new HttpError(404, 'RUNNER_NOT_FOUND', `Ingen löpare med id ${id} hittades`);
    }

    const competition = competitions.find((currentCompetition) => currentCompetition.id === runner.competitionId);
    requireCompetitionOwner(competition, req.organizer.id);

    runner.firstName = validatedBody.firstName;
    runner.lastName = validatedBody.lastName;
    runner.email = validatedBody.email || null;
    runner.club = validatedBody.club || null;
    runner.updatedAt = new Date().toISOString();

    return res.json(runner);
  } catch (err) {
    return next(err);
  }
};

export const deleteRunner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad som arrangör');
    }

    const id = Number(req.params.id);
    const runner = runners.find((currentRunner) => currentRunner.id === id);

    if (!runner) {
      throw new HttpError(404, 'RUNNER_NOT_FOUND', `Ingen löpare med id ${id} hittades`);
    }

    const competition = competitions.find((currentCompetition) => currentCompetition.id === runner.competitionId);
    requireCompetitionOwner(competition, req.organizer.id);

    const runnerIndex = runners.findIndex((currentRunner) => currentRunner.id === id);
    runners.splice(runnerIndex, 1);

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};
