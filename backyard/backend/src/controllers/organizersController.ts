import type { NextFunction, Request, Response } from "express";

import HttpError from "../errors/httpError.js";
import { OrganizerModel, toPublicOrganizer } from "../models/organizer.model.js";
import type {
  LoginBody,
  OrganizerRegistrationBody,
} from "../schemas/organizerSchema.js";
import { createToken, hashPassword, verifyPassword } from "../utils/jwt.js";

const registerOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.validatedBody as OrganizerRegistrationBody;
    const existingOrganizer = await OrganizerModel.findOne({ email });

    if (existingOrganizer) {
      throw new HttpError(409, "EMAIL_ALREADY_EXISTS", "En arrangör med den e-posten finns redan");
    }

    const organizer = await OrganizerModel.create({
      name,
      email,
      passwordHash: await hashPassword(password),
    });

    return res.status(201).json({
      organizer: toPublicOrganizer(organizer),
      token: createToken({ id: organizer.id, email: organizer.email }, organizer.role),
    });
  } catch (error) {
    return next(error);
  }
};

const loginOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.validatedBody as LoginBody;
    const organizer = await OrganizerModel.findOne({ email });

    if (!organizer || !(await verifyPassword(password, organizer.passwordHash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Fel email eller lösenord");
    }

    return res.json({
      organizer: toPublicOrganizer(organizer),
      token: createToken({ id: organizer.id, email: organizer.email }, organizer.role),
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

export { getCurrentOrganizer, loginOrganizer, registerOrganizer };
