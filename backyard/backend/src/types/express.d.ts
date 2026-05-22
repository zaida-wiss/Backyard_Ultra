import type { PublicOrganizer, PublicRunnerAccount } from "./domain";
import type { CompetitionFilters } from "../schemas/competitionFiltersSchema";

declare global {
  namespace Express {
    interface Request {
      organizer?: PublicOrganizer;
      runnerAccount?: PublicRunnerAccount;
      validatedBody?: unknown;
      competitionFilters?: CompetitionFilters;
    }
  }
}

export {};
