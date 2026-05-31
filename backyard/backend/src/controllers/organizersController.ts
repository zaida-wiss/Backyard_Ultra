import type { NextFunction, Request, Response } from "express";

import HttpError from "../errors/httpError.js";
import {
  addRole,
  hasRole,
  toOrganizerAccount,
  toPublicUser,
  toRunnerAccount,
  UserModel,
} from "../models/user.model.js";
import type {
  LoginBody,
  OrganizerRegistrationBody,
} from "../schemas/organizerSchema.js";
import {
  cancelAccountDeletion,
  finalizeAccountDeletion,
  isAccountDeletionDue,
} from "../services/accountDeletion.js";
import { setAuthCookie } from "../utils/authCookie.js";
import { createToken, hashPassword, verifyPassword } from "../utils/jwt.js";

const registerOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.validatedBody as OrganizerRegistrationBody;
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw new HttpError(409, "EMAIL_ALREADY_EXISTS", "Ett konto med den e-posten finns redan");
    }

    const user = await UserModel.create({
      firstName: name,
      lastName: "Arrangör",
      email,
      organizerName: name,
      roles: ["user", "runner", "organizer"],
      passwordHash: await hashPassword(password),
    });

    const token = createToken({ id: user.id, email: user.email }, user.roles);

    setAuthCookie(res, token);

    return res.status(201).json({
      user: toPublicUser(user),
      runner: toRunnerAccount(user),
      organizer: toOrganizerAccount(user),
    });
  } catch (error) {
    return next(error);
  }
};

const loginOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.validatedBody as LoginBody;
    const user = await UserModel.findOne({ email });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Fel email eller lösenord");
    }

    if (isAccountDeletionDue(user)) {
      await finalizeAccountDeletion(user);
      throw new HttpError(410, "ACCOUNT_DELETED", "Kontot har raderats efter ångerperioden");
    }

    if (cancelAccountDeletion(user)) {
      await user.save();
    }

    if (!hasRole(user, "organizer") && !hasRole(user, "admin")) {
      throw new HttpError(403, "FORBIDDEN", "Kontot är inte arrangör");
    }

    const token = createToken({ id: user.id, email: user.email }, user.roles);

    setAuthCookie(res, token);

    return res.json({
      user: toPublicUser(user),
      runner: hasRole(user, "runner") ? toRunnerAccount(user) : null,
      organizer: toOrganizerAccount(user),
    });
  } catch (error) {
    return next(error);
  }
};

const getCurrentOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.organizer) {
    return next(new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad som arrangör"));
  }

  return res.json({
    organizer: req.organizer,
  });
};

const becomeOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, "UNAUTHORIZED", "Du måste vara inloggad");
    }

    const user = await UserModel.findById(req.authUser.id);

    if (!user) {
      throw new HttpError(401, "UNAUTHORIZED", "Användaren finns inte längre");
    }

    const requestedName = typeof req.body?.name === "string" ? req.body.name.trim() : "";

    user.organizerName = requestedName || user.organizerName || `${user.firstName} ${user.lastName}`;
    addRole(user, "organizer");

    await user.save();

    const token = createToken({ id: user.id, email: user.email }, user.roles);

    setAuthCookie(res, token);

    return res.json({
      user: toPublicUser(user),
      runner: hasRole(user, "runner") ? toRunnerAccount(user) : null,
      organizer: toOrganizerAccount(user),
    });
  } catch (error) {
    return next(error);
  }
};

const grantAdminRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      throw new HttpError(404, "USER_NOT_FOUND", "Användaren finns inte");
    }

    addRole(user, "admin");
    await user.save();

    return res.json({
      user: toPublicUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

export {
  becomeOrganizer,
  getCurrentOrganizer,
  grantAdminRole,
  loginOrganizer,
  registerOrganizer,
};
