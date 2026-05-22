import type { Organizer, RunnerAccount } from "./domain";
import type { CompetitionFilters } from "../schemas/competitionFiltersSchema";

declare global {
  namespace Express {
    interface Request {
      organizer?: Organizer;
      runnerAccount?: RunnerAccount;
      validatedBody?: unknown;
      competitionFilters?: CompetitionFilters;
    }
  }
}

export {};
