import app from "./app.js";
import { config } from "./config/env.js";
import { connectToDatabase } from "./config/database.js";
import { startAccountDeletionJob } from "./services/accountDeletionJob.js";
import { logger } from "./utils/logger.js";

const startServer = async () => {
  try {
    await connectToDatabase();

    app.listen(config.port, () => {
      startAccountDeletionJob();
      logger.info({ port: config.port }, `Servern körs på http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Kunde inte starta servern",
    );
    process.exit(1);
  }
};

startServer();
