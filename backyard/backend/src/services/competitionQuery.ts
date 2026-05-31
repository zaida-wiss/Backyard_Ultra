import { Types } from "mongoose";

import type { CompetitionFilters } from "../schemas/competitionFiltersSchema.js";

type CompetitionQuery = Record<string, unknown>;

type DateRangeQuery = {
  $gte?: Date;
  $lte?: Date;
};

type ActiveOnDateQuery = {
  $or: [
    { endAt: { $gte: Date } },
    { endAt: null },
  ];
};

const toDatabaseDate = (dateTimeLocal: string) => new Date(`${dateTimeLocal}:00.000Z`);

const addOrganizerFilter = (
  query: CompetitionQuery,
  organizerId: string | null,
) => {
  if (organizerId) {
    query.organizerId = new Types.ObjectId(organizerId);
  }
};

const addTextFilter = (
  query: CompetitionQuery,
  field: "type" | "place",
  value: string | null,
) => {
  if (value) {
    query[field] = new RegExp(value, "i");
  }
};

const getDateRange = (
  query: CompetitionQuery,
  field: "startAt" | "endAt",
): DateRangeQuery => {
  const currentRange = query[field];

  if (currentRange && typeof currentRange === "object" && !Array.isArray(currentRange)) {
    return currentRange as DateRangeQuery;
  }

  return {};
};

const addDateBoundary = (
  query: CompetitionQuery,
  field: "startAt" | "endAt",
  operator: "$gte" | "$lte",
  date: Date,
) => {
  query[field] = {
    ...getDateRange(query, field),
    [operator]: date,
  };
};

const addDateRangeFilters = (
  query: CompetitionQuery,
  filters: Pick<CompetitionFilters, "startsAfter" | "endsBefore">,
) => {
  if (filters.startsAfter) {
    addDateBoundary(query, "startAt", "$gte", toDatabaseDate(filters.startsAfter));
  }

  if (filters.endsBefore) {
    addDateBoundary(query, "endAt", "$lte", toDatabaseDate(filters.endsBefore));
  }
};

const addActiveOnDateFilter = (
  query: CompetitionQuery,
  date: string | null,
) => {
  if (!date) {
    return;
  }

  addDateBoundary(query, "startAt", "$lte", new Date(`${date}T23:59:59.999Z`));
  query.$or = [
    { endAt: { $gte: new Date(`${date}T00:00:00.000Z`) } },
    { endAt: null },
  ] satisfies ActiveOnDateQuery["$or"];
};

export const buildCompetitionQuery = (
  filters: CompetitionFilters,
): CompetitionQuery => {
  const query: CompetitionQuery = {};

  addOrganizerFilter(query, filters.organizerId);
  addTextFilter(query, "type", filters.type);
  addTextFilter(query, "place", filters.place);
  addDateRangeFilters(query, filters);
  addActiveOnDateFilter(query, filters.date);

  return query;
};
