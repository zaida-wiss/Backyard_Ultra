import type { CreateRunnerInput, Runner } from "../types/domain";
import { createId } from "../utils/ids";

export const createRunner = ({
  competitionId,
  runnerAccountId,
  firstName,
  lastName,
  email,
  club,
}: CreateRunnerInput): Runner => {
  return {
    id: createId('runner'),
    competitionId,
    runnerAccountId: runnerAccountId || null,
    firstName,
    lastName,
    email: email || null,
    club: club || null,
    status: 'registered',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
