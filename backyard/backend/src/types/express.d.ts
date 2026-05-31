import type { AuthUser, PublicOrganizer, PublicRunnerAccount, PublicUser } from "./domain.js";
import type { CompetitionFilters } from "../schemas/competitionFiltersSchema.js";

declare global {
  namespace Express {
    interface Request {
      organizer?: PublicOrganizer;
      runnerAccount?: PublicRunnerAccount;
      user?: PublicUser;
      authUser?: AuthUser;
      validatedBody?: unknown;
      competitionFilters?: CompetitionFilters;
    }
  }
}

export {};
