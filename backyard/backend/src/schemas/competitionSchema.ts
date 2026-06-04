import type { CreateCompetitionInput } from "../types/domain.js";
import HttpError from "../errors/httpError.js";
import {
  isDateTimeLocal,
  optionalText,
  requireText,
  toRequestBody,
} from "./validationHelpers.js";

export type ValidatedCompetitionBody = Omit<CreateCompetitionInput, "organizerId">;

const parseBoolean = (
  value: unknown,
  fallback: boolean,
  fieldName: string,
) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  throw new HttpError(400, "BAD_REQUEST", `${fieldName} måste vara true eller false`);
};

const parseEnum = <Value extends string>(
  value: unknown,
  allowedValues: readonly Value[],
  fallback: Value,
  fieldName: string,
) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "string" && allowedValues.includes(value as Value)) {
    return value as Value;
  }

  throw new HttpError(
    400,
    "BAD_REQUEST",
    `${fieldName} måste vara en av: ${allowedValues.join(", ")}`,
  );
};

export const parseCompetition = (body: unknown): ValidatedCompetitionBody => {
  const requestBody = toRequestBody(body);
  const name = requireText(requestBody, "name", "tävlingsnamn");
  const type = requireText(requestBody, "type", "tävlingsform");
  const place = requireText(requestBody, "place", "plats");
  const startAt = requireText(requestBody, "startAt", "starttid");
  const endAt = optionalText(requestBody, "endAt");
  const registrationDeadline = optionalText(requestBody, "registrationDeadline");
  const templateKey = parseEnum(
    requestBody.templateKey,
    ["backyard-ultra"] as const,
    "backyard-ultra",
    "templateKey",
  );
  const status = parseEnum(
    requestBody.status,
    ["draft", "open", "closed", "in_progress", "finished"] as const,
    "open",
    "status",
  );
  const registrationMode = parseEnum(
    requestBody.registrationMode,
    ["self_service", "organizer_only", "both"] as const,
    "both",
    "registrationMode",
  );
  const isPublic = parseBoolean(requestBody.isPublic, true, "isPublic");
  const allowTeamRegistration = parseBoolean(
    requestBody.allowTeamRegistration,
    false,
    "allowTeamRegistration",
  );
  const allowRepresentingOrganization = parseBoolean(
    requestBody.allowRepresentingOrganization,
    true,
    "allowRepresentingOrganization",
  );

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

  if (registrationDeadline && !isDateTimeLocal(registrationDeadline)) {
    throw new HttpError(
      400,
      "BAD_REQUEST",
      "registrationDeadline måste skrivas som YYYY-MM-DDTHH:mm när deadline anges",
    );
  }

  if (endAt && Date.parse(endAt) <= Date.parse(startAt)) {
    throw new HttpError(400, "BAD_REQUEST", "sluttiden måste vara efter starttiden");
  }

  if (registrationDeadline && Date.parse(registrationDeadline) > Date.parse(startAt)) {
    throw new HttpError(
      400,
      "BAD_REQUEST",
      "sista anmälningsdag måste vara före eller vid starttiden",
    );
  }

  return {
    name,
    type,
    templateKey,
    status,
    place,
    startAt,
    endAt,
    registrationDeadline,
    isPublic,
    registrationMode,
    allowTeamRegistration,
    allowRepresentingOrganization,
  };
};
