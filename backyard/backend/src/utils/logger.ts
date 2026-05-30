import pino from "pino";

import { config } from "../config/env.js";

// LogContext är extra data vi vill koppla till en loggrad, t.ex. route, status eller userId.
type LogContext = Record<string, unknown>;

// Pino skriver strukturerade JSON-loggar och kan maskera känsliga fält automatiskt.
const pinoLogger = pino({
  level: config.nodeEnv === "production" ? "info" : "debug",
  redact: {
    paths: ["authorization", "password", "passwordHash", "token"],
    censor: "[REDACTED]",
  },
});

// Den här wrappern håller resten av koden enkel och lätt att byta om vi ändrar logger senare.
const logger = {
  debug: (context: LogContext, message: string) => pinoLogger.debug(context, message),
  info: (context: LogContext, message: string) => pinoLogger.info(context, message),
  error: (context: LogContext, message: string) => pinoLogger.error(context, message),
};

export { logger, pinoLogger };
