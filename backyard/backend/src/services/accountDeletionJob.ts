import { processDueAccountDeletions } from "./accountDeletion.js";
import { logger } from "../utils/logger.js";

const ACCOUNT_DELETION_JOB_INTERVAL_MS = 60 * 60 * 1000;

const runAccountDeletionJob = async () => {
  try {
    const deletedAccountCount = await processDueAccountDeletions();

    if (deletedAccountCount > 0) {
      logger.info({ deletedAccountCount }, "Schemalagda kontoraderingar har genomförts");
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Kunde inte genomföra schemalagda kontoraderingar",
    );
  }
};

const startAccountDeletionJob = () => {
  void runAccountDeletionJob();

  const interval = setInterval(() => {
    void runAccountDeletionJob();
  }, ACCOUNT_DELETION_JOB_INTERVAL_MS);

  interval.unref();
};

export { startAccountDeletionJob };
