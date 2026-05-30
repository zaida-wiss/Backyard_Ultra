import HttpError from "../errors/httpError.js";

export type RequestBody = Record<string, unknown>;

const isRequestBody = (body: unknown): body is RequestBody => {
  if (!body) {
    return false;
  }

  if (typeof body !== "object") {
    return false;
  }

  return !Array.isArray(body);
};

const isNonEmptyString = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }

  return value.trim().length > 0;
};

export const toRequestBody = (body: unknown): RequestBody => {
  return isRequestBody(body) ? body : {};
};

export const isEmail = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isDateTimeLocal = (value: unknown): value is string => {
  if (typeof value !== "string") {
    return false;
  }

  const hasDateTimeLocalFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);

  if (!hasDateTimeLocalFormat) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
};

export const requireText = (
  body: RequestBody,
  field: string,
  label = field,
): string => {
  const value = body[field];

  if (!isNonEmptyString(value)) {
    throw new HttpError(400, "BAD_REQUEST", `${label} krävs`);
  }

  return value.trim();
};

export const optionalText = (
  body: RequestBody,
  field: string,
): string | null => {
  const value = body[field];

  if (!value) {
    return null;
  }

  return String(value).trim() || null;
};
