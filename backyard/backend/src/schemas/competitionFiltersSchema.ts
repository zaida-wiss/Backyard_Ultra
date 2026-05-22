import HttpError from "../errors/httpError";

export type CompetitionFilters = {
  organizerId: number | null;
  type: string | null;
  place: string | null;
  date: string | null;
  startsAfter: string | null;
  endsBefore: string | null;
};

const toSingleString = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ? String(value[0]) : null;
  }

  return String(value);
};

const parseOrganizerId = (value: unknown): number | null => {
  const organizerId = toSingleString(value);

  if (!organizerId) {
    return null;
  }

  const parsedOrganizerId = Number(organizerId);

  if (Number.isNaN(parsedOrganizerId)) {
    throw new HttpError(400, "BAD_REQUEST", "organizerId måste vara ett tal");
  }

  return parsedOrganizerId;
};

const parseDate = (value: unknown): string | null => {
  const date = toSingleString(value);

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new HttpError(400, "BAD_REQUEST", "date måste skrivas som YYYY-MM-DD");
  }

  return date;
};

const parseDateTime = (value: unknown, fieldName: string): string | null => {
  const dateTime = toSingleString(value);

  if (dateTime && Number.isNaN(Date.parse(dateTime))) {
    throw new HttpError(400, "BAD_REQUEST", `${fieldName} måste vara ett giltigt datum`);
  }

  return dateTime;
};

export const parseCompetitionFilters = (
  query: Record<string, unknown>,
): CompetitionFilters => {
  return {
    organizerId: parseOrganizerId(query.organizerId),
    type: toSingleString(query.type)?.toLowerCase() || null,
    place: toSingleString(query.place)?.toLowerCase() || null,
    date: parseDate(query.date),
    startsAfter: parseDateTime(query.startsAfter, "startsAfter"),
    endsBefore: parseDateTime(query.endsBefore, "endsBefore"),
  };
};
