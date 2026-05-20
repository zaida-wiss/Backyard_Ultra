import type { NextFunction, Request, Response } from "express";
import HttpError from "../utils/httpError";

type RequestBody = Record<string, unknown>;

function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isDateTimeLocal(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function requireText(body: RequestBody, field: string, label = field): string {
  const value = body[field];

  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, 'BAD_REQUEST', `${label} krävs`);
  }

  return value.trim();
}

export const validateOrganizerRegistration = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const body = (req.body || {}) as RequestBody;
    const name = requireText(body, 'name', 'namn');
    const email = requireText(body, 'email', 'email').toLowerCase();
    const password = requireText(body, 'password', 'lösenord');

    if (!isEmail(email)) {
      throw new HttpError(400, 'BAD_REQUEST', 'email måste vara en giltig e-postadress');
    }

    if (password.length < 8) {
      throw new HttpError(400, 'BAD_REQUEST', 'lösenord måste vara minst 8 tecken');
    }

    req.validatedBody = { name, email, password };
    return next();
  } catch (err) {
    return next(err);
  }
};

export const validateLogin = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const body = (req.body || {}) as RequestBody;
    const email = requireText(body, 'email', 'email').toLowerCase();
    const password = requireText(body, 'password', 'lösenord');

    req.validatedBody = { email, password };
    return next();
  } catch (err) {
    return next(err);
  }
};

export const validateCompetition = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const body = (req.body || {}) as RequestBody;
    const name = requireText(body, 'name', 'tävlingsnamn');
    const type = requireText(body, 'type', 'tävlingsform');
    const place = requireText(body, 'place', 'plats');
    const startAt = requireText(body, 'startAt', 'starttid');
    const endAt = requireText(body, 'endAt', 'sluttid');

    if (!isDateTimeLocal(startAt) || !isDateTimeLocal(endAt)) {
      throw new HttpError(400, 'BAD_REQUEST', 'startAt och endAt måste skrivas som YYYY-MM-DDTHH:mm');
    }

    if (Date.parse(endAt) <= Date.parse(startAt)) {
      throw new HttpError(400, 'BAD_REQUEST', 'sluttiden måste vara efter starttiden');
    }

    req.validatedBody = { name, type, place, startAt, endAt };
    return next();
  } catch (err) {
    return next(err);
  }
};

export const validateRunner = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const body = (req.body || {}) as RequestBody;
    const firstName = requireText(body, 'firstName', 'förnamn');
    const lastName = requireText(body, 'lastName', 'efternamn');
    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const club = body.club ? String(body.club).trim() : null;

    if (email && !isEmail(email)) {
      throw new HttpError(400, 'BAD_REQUEST', 'email måste vara en giltig e-postadress');
    }

    req.validatedBody = { firstName, lastName, email, club };
    return next();
  } catch (err) {
    return next(err);
  }
};

export const validateRunnerAccountRegistration = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const body = (req.body || {}) as RequestBody;
    const firstName = requireText(body, 'firstName', 'förnamn');
    const lastName = requireText(body, 'lastName', 'efternamn');
    const email = requireText(body, 'email', 'email').toLowerCase();
    const password = requireText(body, 'password', 'lösenord');
    const club = body.club ? String(body.club).trim() : null;

    if (!isEmail(email)) {
      throw new HttpError(400, 'BAD_REQUEST', 'email måste vara en giltig e-postadress');
    }

    if (password.length < 8) {
      throw new HttpError(400, 'BAD_REQUEST', 'lösenord måste vara minst 8 tecken');
    }

    req.validatedBody = { firstName, lastName, email, password, club };
    return next();
  } catch (err) {
    return next(err);
  }
};
