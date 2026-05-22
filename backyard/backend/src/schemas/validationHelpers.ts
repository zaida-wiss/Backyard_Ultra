import HttpError from "../errors/httpError";

export type RequestBody = Record<string, unknown>;

export const toRequestBody = (body: unknown): RequestBody => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }

  return body as RequestBody;
};

export const isEmail = (value: unknown): value is string => {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isDateTimeLocal = (value: unknown): value is string => {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value));
};

export const requireText = (
  body: RequestBody,
  field: string,
  label = field,
): string => {
  const value = body[field];

  if (!value || typeof value !== "string" || value.trim().length === 0) {
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
