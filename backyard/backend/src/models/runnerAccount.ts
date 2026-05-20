import type { CreateRunnerAccountInput, PublicRunnerAccount, RunnerAccount } from "../types/domain";
import { createId } from "../utils/ids";

export const createRunnerAccount = ({
  firstName,
  lastName,
  email,
  passwordHash,
  club,
}: CreateRunnerAccountInput): RunnerAccount => {
  return {
    id: createId('runnerAccount'),
    firstName,
    lastName,
    email,
    passwordHash,
    club: club || null,
    createdAt: new Date().toISOString(),
  };
};

export const toPublicRunnerAccount = (runnerAccount: RunnerAccount): PublicRunnerAccount => {
  return {
    id: runnerAccount.id,
    firstName: runnerAccount.firstName,
    lastName: runnerAccount.lastName,
    email: runnerAccount.email,
    club: runnerAccount.club,
    createdAt: runnerAccount.createdAt,
  };
};
