import type { AuthUser, PublicOrganizer, PublicRunnerAccount } from "./domain.js";
import type { CompetitionFilters } from "../schemas/competitionFiltersSchema.js";

declare global {
  namespace Express {
    interface Request {
      organizer?: PublicOrganizer;
      runnerAccount?: PublicRunnerAccount;
      authUser?: AuthUser;
      validatedBody?: unknown;
      competitionFilters?: CompetitionFilters;
    }
  }
}

export {};
