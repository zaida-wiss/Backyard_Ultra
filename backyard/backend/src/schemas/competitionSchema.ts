import type { CreateCompetitionInput } from "../types/domain";
import HttpError from "../errors/httpError";
import { isDateTimeLocal, requireText, toRequestBody } from "./validationHelpers";

export type ValidatedCompetitionBody = Omit<CreateCompetitionInput, "organizerId">;

export const parseCompetition = (body: unknown): ValidatedCompetitionBody => {
  const requestBody = toRequestBody(body);
  const name = requireText(requestBody, "name", "tävlingsnamn");
  const type = requireText(requestBody, "type", "tävlingsform");
  const place = requireText(requestBody, "place", "plats");
  const startAt = requireText(requestBody, "startAt", "starttid");
  const endAt = requireText(requestBody, "endAt", "sluttid");

  if (!isDateTimeLocal(startAt) || !isDateTimeLocal(endAt)) {
    throw new HttpError(
      400,
      "BAD_REQUEST",
      "startAt och endAt måste skrivas som YYYY-MM-DDTHH:mm",
    );
  }

  if (Date.parse(endAt) <= Date.parse(startAt)) {
    throw new HttpError(400, "BAD_REQUEST", "sluttiden måste vara efter starttiden");
  }

  return { name, type, place, startAt, endAt };
};
