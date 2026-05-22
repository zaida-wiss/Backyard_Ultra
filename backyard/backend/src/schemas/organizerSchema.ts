import HttpError from "../errors/httpError";
import { isEmail, requireText, toRequestBody } from "./validationHelpers";

export type OrganizerRegistrationBody = {
  name: string;
  email: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export const parseOrganizerRegistration = (body: unknown): OrganizerRegistrationBody => {
  const requestBody = toRequestBody(body);
  const name = requireText(requestBody, "name", "namn");
  const email = requireText(requestBody, "email", "email").toLowerCase();
  const password = requireText(requestBody, "password", "lösenord");

  if (!isEmail(email)) {
    throw new HttpError(400, "BAD_REQUEST", "email måste vara en giltig e-postadress");
  }

  if (password.length < 8) {
    throw new HttpError(400, "BAD_REQUEST", "lösenord måste vara minst 8 tecken");
  }

  return { name, email, password };
};

export const parseLogin = (body: unknown): LoginBody => {
  const requestBody = toRequestBody(body);
  const email = requireText(requestBody, "email", "email").toLowerCase();
  const password = requireText(requestBody, "password", "lösenord");

  return { email, password };
};
