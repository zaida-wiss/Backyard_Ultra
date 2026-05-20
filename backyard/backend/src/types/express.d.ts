import type { Organizer, RunnerAccount } from "./domain";

declare global {
  namespace Express {
    interface Request {
      organizer?: Organizer;
      runnerAccount?: RunnerAccount;
      validatedBody?: unknown;
    }
  }
}

export {};
