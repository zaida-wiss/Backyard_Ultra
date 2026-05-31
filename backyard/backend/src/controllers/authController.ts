import type { NextFunction, Request, Response } from "express";

import HttpError from "../errors/httpError.js";
import { CompetitionModel, toCompetitionResponse } from "../models/competition.model.js";
import { RunnerModel, toRunnerResponse } from "../models/runner.model.js";
import { UserModel, toPublicUser } from "../models/user.model.js";
import { scheduleAccountDeletion } from "../services/accountDeletion.js";
import { clearAuthCookie } from "../utils/authCookie.js";

const getCurrentSession = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad"));
  }

  return res.json({
    user: req.user,
    runner: req.runnerAccount ?? null,
    organizer: req.organizer ?? null,
  });
};

const logout = (_req: Request, res: Response) => {
  clearAuthCookie(res);

  return res.status(204).send();
};

const exportCurrentUserData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad");
    }

    const user = await UserModel.findById(req.authUser.id);

    if (!user || user.deletedAt) {
      throw new HttpError(401, "UNAUTHORIZED", "Användaren finns inte längre");
    }

    const [runnerRegistrations, organizedCompetitions] = await Promise.all([
      RunnerModel.find({
        deletedAt: null,
        $or: [
          { runnerAccountId: user._id },
          { email: user.email },
        ],
      }).sort({ createdAt: 1 }),
      CompetitionModel.find({ organizerId: user._id }).sort({ createdAt: 1 }),
    ]);

    return res.json({
      exportedAt: new Date().toISOString(),
      user: toPublicUser(user),
      runnerRegistrations: runnerRegistrations.map(toRunnerResponse),
      organizedCompetitions: organizedCompetitions.map(toCompetitionResponse),
    });
  } catch (error) {
    return next(error);
  }
};

const softDeleteCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad");
    }

    const user = await UserModel.findById(req.authUser.id);

    if (!user || user.deletedAt) {
      throw new HttpError(401, "UNAUTHORIZED", "Användaren finns inte längre");
    }

    scheduleAccountDeletion(user);
    await user.save();
    clearAuthCookie(res);

    return res.status(202).json({
      deletionRequestedAt: user.deletionRequestedAt?.toISOString() ?? null,
      deletionScheduledAt: user.deletionScheduledAt?.toISOString() ?? null,
    });
  } catch (error) {
    return next(error);
  }
};

const hardDeleteCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad");
    }

    const user = await UserModel.findById(req.authUser.id);

    if (!user || user.deletedAt) {
      throw new HttpError(401, "UNAUTHORIZED", "Användaren finns inte längre");
    }

    const organizedCompetitionCount = await CompetitionModel.countDocuments({ organizerId: user._id });

    if (organizedCompetitionCount > 0) {
      throw new HttpError(
        409,
        "ACCOUNT_OWNS_COMPETITIONS",
        "Kontot äger tävlingar. Flytta eller hantera tävlingarna innan hårdradering.",
      );
    }

    await RunnerModel.deleteMany({
      $or: [
        { runnerAccountId: user._id },
        { email: user.email },
      ],
    });
    await UserModel.deleteOne({ _id: user._id });

    clearAuthCookie(res);

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export {
  exportCurrentUserData,
  getCurrentSession,
  hardDeleteCurrentUser,
  logout,
  softDeleteCurrentUser,
};
