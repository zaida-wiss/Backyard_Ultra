import type { NextFunction, Request, Response } from "express";

import HttpError from "../errors/httpError.js";
import { CompetitionModel, toCompetitionResponse } from "../models/competition.model.js";
import {
  TimekeeperAssignmentModel,
  toTimekeeperAssignmentResponse,
} from "../models/timekeeperAssignment.model.js";
import {
  addRole,
  hasRole,
  toOrganizerAccount,
  toPublicUser,
  toRunnerAccount,
  UserModel,
} from "../models/user.model.js";
import { isEmail } from "../schemas/validationHelpers.js";
import { setAuthCookie } from "../utils/authCookie.js";
import { createToken } from "../utils/jwt.js";
import { getCompetitionOrThrow, requireCompetitionOwner } from "./competitionsController.js";

const becomeTimekeeper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad");
    }

    const user = await UserModel.findById(req.authUser.id);

    if (!user) {
      throw new HttpError(401, "UNAUTHORIZED", "Användaren finns inte längre");
    }

    addRole(user, "timekeeper");
    await user.save();

    const token = createToken({ id: user.id, email: user.email }, user.roles);

    setAuthCookie(res, token);

    return res.json({
      user: toPublicUser(user),
      runner: hasRole(user, "runner") ? toRunnerAccount(user) : null,
      organizer: hasRole(user, "organizer") || hasRole(user, "admin")
        ? toOrganizerAccount(user)
        : null,
    });
  } catch (error) {
    return next(error);
  }
};

const listMyTimekeeperAssignments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad");
    }

    const assignments = await TimekeeperAssignmentModel.find({
      userId: req.authUser.id,
    }).sort({ createdAt: 1 });
    const competitions = await CompetitionModel.find({
      _id: { $in: assignments.map((assignment) => assignment.competitionId) },
    });
    const competitionsById = new Map(
      competitions.map((competition) => [competition.id, toCompetitionResponse(competition)]),
    );

    return res.json(assignments.map((assignment) => ({
      ...toTimekeeperAssignmentResponse(assignment),
      competition: competitionsById.get(assignment.competitionId.toString()) ?? null,
    })));
  } catch (error) {
    return next(error);
  }
};

const assignTimekeeperToCompetition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.organizer) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör");
    }

    const competition = await getCompetitionOrThrow(String(req.params.competitionId));

    requireCompetitionOwner(competition, req.organizer.id, req.organizer.role);

    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!isEmail(email)) {
      throw new HttpError(400, "BAD_REQUEST", "email måste vara en giltig e-postadress");
    }

    const user = await UserModel.findOne({ email, deletedAt: null });

    if (!user) {
      throw new HttpError(404, "USER_NOT_FOUND", "Ingen användare med den e-posten hittades");
    }

    addRole(user, "timekeeper");
    await user.save();

    const assignment = await TimekeeperAssignmentModel.findOneAndUpdate(
      {
        competitionId: competition._id,
        userId: user._id,
      },
      {
        $setOnInsert: {
          competitionId: competition._id,
          userId: user._id,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );

    return res.status(201).json({
      ...toTimekeeperAssignmentResponse(assignment),
      competition: toCompetitionResponse(competition),
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

export {
  assignTimekeeperToCompetition,
  becomeTimekeeper,
  listMyTimekeeperAssignments,
};
