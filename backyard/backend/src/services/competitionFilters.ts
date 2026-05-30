import type { Competition } from "../types/domain.js";
import type { CompetitionFilters } from "../schemas/competitionFiltersSchema.js";

type CompetitionFilterRule = {
  isActive: (filters: CompetitionFilters) => boolean;
  matches: (competition: Competition, filters: CompetitionFilters) => boolean;
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
