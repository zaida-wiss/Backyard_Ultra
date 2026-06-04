import type {
  CreateRunnerAccountInput,
  CreateRunnerInput,
  RunnerStatus,
  TeamMember,
} from "../types/domain.js";
import HttpError from "../errors/httpError.js";
import {
  isEmail,
  optionalText,
  requireText,
  toRequestBody,
} from "./validationHelpers.js";

export type ValidatedRunnerBody = Omit<CreateRunnerInput, "competitionId">;

export type RunnerLapTimesBody = {
  lapTimes: number[];
  status?: RunnerStatus;
  isManualCorrection: boolean;
  changeReason: string | null;
};

export type RunnerAccountRegistrationBody = Omit<CreateRunnerAccountInput, "passwordHash"> & {
  password: string;
};

export const parseRunner = (body: unknown): ValidatedRunnerBody => {
  const requestBody = toRequestBody(body);
  const runnerNumber = parseOptionalPositiveInteger(requestBody.runnerNumber, "runnerNumber");
  const registrationType = parseRegistrationType(requestBody.registrationType);
  const teamName = optionalText(requestBody, "teamName");
  const teamMembers = parseTeamMembers(requestBody.teamMembers);
  const firstName = requireText(requestBody, "firstName", "förnamn");
  const lastName = requireText(requestBody, "lastName", "efternamn");
  const email = optionalText(requestBody, "email")?.toLowerCase() ?? null;
  const club = optionalText(requestBody, "club");

  if (email && !isEmail(email)) {
    throw new HttpError(400, "BAD_REQUEST", "email måste vara en giltig e-postadress");
  }

  if (registrationType === "team" && !teamName) {
    throw new HttpError(400, "BAD_REQUEST", "lagnamn krävs vid laganmälan");
  }

  return {
    runnerNumber,
    registrationType,
    teamName,
    teamMembers,
    firstName,
    lastName,
    email,
    club,
  };
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

export const parseRunnerLapTimes = (body: unknown): RunnerLapTimesBody => {
  const requestBody = toRequestBody(body);
  const { lapTimes } = requestBody;
  const status = parseRunnerStatus(requestBody.status);
  const isManualCorrection = parseBoolean(
    requestBody.isManualCorrection,
    false,
    "isManualCorrection",
  );
  const changeReason = optionalText(requestBody, "changeReason");

  if (!Array.isArray(lapTimes)) {
    throw new HttpError(400, "BAD_REQUEST", "lapTimes måste vara en lista med tider");
  }

  const parsedLapTimes = lapTimes.map((lapTime) => {
    const parsedLapTime = Number(lapTime);

    if (!Number.isFinite(parsedLapTime) || parsedLapTime < 0) {
      throw new HttpError(400, "BAD_REQUEST", "alla tider måste vara positiva nummer");
    }

    return parsedLapTime;
  });

  if (isManualCorrection && !changeReason) {
    throw new HttpError(
      400,
      "BAD_REQUEST",
      "anledning krävs vid manuell korrigering",
    );
  }

  return {
    lapTimes: parsedLapTimes,
    status,
    isManualCorrection,
    changeReason,
  };
};

const parseOptionalPositiveInteger = (
  value: unknown,
  fieldName: string,
): number | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new HttpError(400, "BAD_REQUEST", `${fieldName} måste vara ett positivt heltal`);
  }

  return parsedValue;
};

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

const parseRegistrationType = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return "individual" as const;
  }

  if (value === "individual" || value === "team") {
    return value;
  }

  throw new HttpError(
    400,
    "BAD_REQUEST",
    "registrationType måste vara individual eller team",
  );
};

const parseRunnerStatus = (value: unknown): RunnerStatus | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (
    value === "registered"
    || value === "active"
    || value === "dnf"
    || value === "finished"
  ) {
    return value;
  }

  throw new HttpError(
    400,
    "BAD_REQUEST",
    "status måste vara registered, active, dnf eller finished",
  );
};

const parseTeamMembers = (value: unknown): TeamMember[] => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new HttpError(400, "BAD_REQUEST", "teamMembers måste vara en lista");
  }

  return value.map((member) => {
    if (!member || typeof member !== "object" || Array.isArray(member)) {
      throw new HttpError(400, "BAD_REQUEST", "varje lagmedlem måste vara ett objekt");
    }

    const memberBody = member as Record<string, unknown>;
    const firstName = requireText(memberBody, "firstName", "lagmedlems förnamn");
    const lastName = requireText(memberBody, "lastName", "lagmedlems efternamn");

    return { firstName, lastName };
  });
};
