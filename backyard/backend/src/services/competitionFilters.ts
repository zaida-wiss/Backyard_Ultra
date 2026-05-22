import type { Competition } from "../types/domain";
import HttpError from "../utils/httpError";

type CompetitionFilters = {
  organizerId: number | null;
  type: string | null;
  place: string | null;
  date: string | null;
  startsAfter: string | null;
  endsBefore: string | null;
};

type CompetitionFilterRule = {
  isActive: (filters: CompetitionFilters) => boolean;
  matches: (competition: Competition, filters: CompetitionFilters) => boolean;
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
    throw new HttpError(400, 'BAD_REQUEST', 'organizerId måste vara ett tal');
  }

  return parsedOrganizerId;
};

const parseDate = (value: unknown): string | null => {
  const date = toSingleString(value);

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new HttpError(400, 'BAD_REQUEST', 'date måste skrivas som YYYY-MM-DD');
  }

  return date;
};

const parseDateTime = (value: unknown, fieldName: string): string | null => {
  const dateTime = toSingleString(value);

  if (dateTime && Number.isNaN(Date.parse(dateTime))) {
    throw new HttpError(400, 'BAD_REQUEST', `${fieldName} måste vara ett giltigt datum`);
  }

  return dateTime;
};

export const parseCompetitionFilters = (query: Record<string, unknown>): CompetitionFilters => {
  return {
    organizerId: parseOrganizerId(query.organizerId),
    type: toSingleString(query.type)?.toLowerCase() || null,
    place: toSingleString(query.place)?.toLowerCase() || null,
    date: parseDate(query.date),
    startsAfter: parseDateTime(query.startsAfter, 'startsAfter'),
    endsBefore: parseDateTime(query.endsBefore, 'endsBefore'),
  };
};

const competitionFilterRules: CompetitionFilterRule[] = [
  {
    isActive: ({ organizerId }) => organizerId !== null,
    matches: (competition, { organizerId }) => competition.organizerId === organizerId,
  },
  {
    isActive: ({ type }) => type !== null,
    matches: (competition, { type }) => competition.type.toLowerCase().includes(type ?? ''),
  },
  {
    isActive: ({ place }) => place !== null,
    matches: (competition, { place }) => competition.place.toLowerCase().includes(place ?? ''),
  },
  {
    isActive: ({ date }) => date !== null,
    matches: (competition, { date }) => (
      competition.startAt.slice(0, 10) <= date!
      && competition.endAt.slice(0, 10) >= date!
    ),
  },
  {
    isActive: ({ startsAfter }) => startsAfter !== null,
    matches: (competition, { startsAfter }) => (
      Date.parse(competition.startAt) >= Date.parse(startsAfter!)
    ),
  },
  {
    isActive: ({ endsBefore }) => endsBefore !== null,
    matches: (competition, { endsBefore }) => (
      Date.parse(competition.endAt) <= Date.parse(endsBefore!)
    ),
  },
];

export const filterCompetitions = (
  competitions: Competition[],
  filters: CompetitionFilters,
): Competition[] => {
  const activeRules = competitionFilterRules.filter((rule) => rule.isActive(filters));

  return competitions.filter((competition) => (
    activeRules.every((rule) => rule.matches(competition, filters))
  ));
};
