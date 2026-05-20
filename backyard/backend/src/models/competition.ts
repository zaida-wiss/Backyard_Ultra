import type { Competition, CreateCompetitionInput } from "../types/domain";
import { createId } from "../utils/ids";

export const createCompetition = ({
  organizerId,
  name,
  type,
  startAt,
  endAt,
  place,
}: CreateCompetitionInput): Competition => {
  return {
    id: createId('competition'),
    organizerId,
    name,
    type,
    place,
    startAt,
    endAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
