import type { NextFunction, Request, Response } from "express";
import { organizers } from "../data/store";
import { createOrganizer, toPublicOrganizer } from "../models/organizer";
import HttpError from "../utils/httpError";
import { createToken, hashPassword, verifyPassword } from "../utils/security";

type RegisterOrganizerBody = {
  name: string;
  email: string;
  password: string;
};

type LoginOrganizerBody = {
  email: string;
  password: string;
};

export const registerOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.validatedBody as RegisterOrganizerBody;
    const existingOrganizer = organizers.find((organizer) => organizer.email === email);

    if (existingOrganizer) {
      throw new HttpError(409, 'EMAIL_ALREADY_EXISTS', 'En arrangör med den e-posten finns redan');
    }

    const organizer = createOrganizer({
      name,
      email,
      passwordHash: hashPassword(password),
    });

    organizers.push(organizer);

    return res.status(201).json({
      organizer: toPublicOrganizer(organizer),
      token: createToken(organizer, "organizer"),
    });
  } catch (err) {
    return next(err);
  }
};

export const loginOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.validatedBody as LoginOrganizerBody;
    const organizer = organizers.find((currentOrganizer) => currentOrganizer.email === email);

    if (!organizer || !verifyPassword(password, organizer.passwordHash)) {
      throw new HttpError(401, 'INVALID_CREDENTIALS', 'Fel email eller lösenord');
    }

    return res.json({
      organizer: toPublicOrganizer(organizer),
      token: createToken(organizer, "organizer"),
    });
  } catch (err) {
    return next(err);
  }
};

export const getCurrentOrganizer = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.organizer) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Du måste vara inloggad som arrangör'));
  }

  res.json({
    organizer: toPublicOrganizer(req.organizer),
  });
};
