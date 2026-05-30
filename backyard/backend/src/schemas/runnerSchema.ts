import type { CreateRunnerAccountInput, CreateRunnerInput } from "../types/domain.js";
import HttpError from "../errors/httpError.js";
import {
  isEmail,
  optionalText,
  requireText,
  toRequestBody,
} from "./validationHelpers.js";

export type ValidatedRunnerBody = Omit<CreateRunnerInput, "competitionId">;

export type RunnerAccountRegistrationBody = Omit<CreateRunnerAccountInput, "passwordHash"> & {
  password: string;
};

export const parseRunner = (body: unknown): ValidatedRunnerBody => {
  const requestBody = toRequestBody(body);
  const firstName = requireText(requestBody, "firstName", "förnamn");
  const lastName = requireText(requestBody, "lastName", "efternamn");
  const email = optionalText(requestBody, "email")?.toLowerCase() ?? null;
  const club = optionalText(requestBody, "club");

  if (email && !isEmail(email)) {
    throw new HttpError(400, "BAD_REQUEST", "email måste vara en giltig e-postadress");
  }

  return { firstName, lastName, email, club };
};

export const parseRunnerAccountRegistration = (
  body: unknown,
): RunnerAccountRegistrationBody => {
  const requestBody = toRequestBody(body);
  const firstName = requireText(requestBody, "firstName", "förnamn");
  const lastName = requireText(requestBody, "lastName", "efternamn");
  const email = requireText(requestBody, "email", "email").toLowerCase();
  const password = requireText(requestBody, "password", "lösenord");
  const club = optionalText(requestBody, "club");

  if (!isEmail(email)) {
    throw new HttpError(400, "BAD_REQUEST", "email måste vara en giltig e-postadress");
  }

  if (password.length < 8) {
    throw new HttpError(400, "BAD_REQUEST", "lösenord måste vara minst 8 tecken");
  }

  return { firstName, lastName, email, password, club };
};
