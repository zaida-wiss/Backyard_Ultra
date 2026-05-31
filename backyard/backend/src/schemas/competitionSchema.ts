import type { CreateCompetitionInput } from "../types/domain.js";
import HttpError from "../errors/httpError.js";
import { isDateTimeLocal, optionalText, requireText, toRequestBody } from "./validationHelpers.js";

export type ValidatedCompetitionBody = Omit<CreateCompetitionInput, "organizerId">;

export const parseCompetition = (body: unknown): ValidatedCompetitionBody => {
  const requestBody = toRequestBody(body);
  const name = requireText(requestBody, "name", "tävlingsnamn");
  const type = requireText(requestBody, "type", "tävlingsform");
  const place = requireText(requestBody, "place", "plats");
  const startAt = requireText(requestBody, "startAt", "starttid");
  const endAt = optionalText(requestBody, "endAt");

  if (!isDateTimeLocal(startAt)) {
    throw new HttpError(
      400,
      "BAD_REQUEST",
      "startAt måste skrivas som YYYY-MM-DDTHH:mm",
    );
  }

  if (endAt && !isDateTimeLocal(endAt)) {
    throw new HttpError(
      400,
      "BAD_REQUEST",
      "endAt måste skrivas som YYYY-MM-DDTHH:mm när sluttid anges",
    );
  }

  if (endAt && Date.parse(endAt) <= Date.parse(startAt)) {
    throw new HttpError(400, "BAD_REQUEST", "sluttiden måste vara efter starttiden");
  }

  return { name, type, place, startAt, endAt };
};
