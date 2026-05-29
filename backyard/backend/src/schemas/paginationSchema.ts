import HttpError from "../errors/httpError";

export type Pagination = {
  page: number;
  limit: number;
};

const parsePositiveInt = (
  value: unknown,
  fallback: number,
  fieldName: string,
): number => {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new HttpError(400, "BAD_REQUEST", `${fieldName} måste vara ett positivt heltal`);
  }

  return parsedValue;
};

export const parsePagination = (query: Record<string, unknown>): Pagination => {
  return {
    page: parsePositiveInt(query.page, 1, "page"),
    limit: parsePositiveInt(query.limit, 20, "limit"),
  };
};