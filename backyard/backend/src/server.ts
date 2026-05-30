import app from "./app.js";
import { config } from "./config/env.js";
import { connectToDatabase } from "./config/database.js";
import { logger } from "./utils/logger.js";

const startServer = async () => {
  try {
    await connectToDatabase();

    app.listen(config.port, () => {
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
