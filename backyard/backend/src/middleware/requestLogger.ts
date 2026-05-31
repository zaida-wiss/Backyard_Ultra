import type { Request, Response } from "express";
import { pinoHttp } from "pino-http";

import { pinoLogger } from "../utils/logger.js";

// pino-http loggar HTTP-detaljer automatiskt: metod, url, status och responstid.
// Vi lägger bara till projektets egna fält, och undviker fortfarande body/token.
const requestLogger = pinoHttp<Request, Response>({
  logger: pinoLogger,
  customProps: (req) => {
    return {
      userId: req.authUser?.id ?? null,
      roles: req.authUser?.roles ?? null,
    };
  },
  customLogLevel: (_req, res, error) => {
    if (error || res.statusCode >= 500) {
      return "error";
    }

    return "info";
  },
});

export { requestLogger };
