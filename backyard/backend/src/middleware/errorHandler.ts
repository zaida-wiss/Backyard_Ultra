import type { NextFunction, Request, Response } from "express";
import HttpError from "../errors/httpError.js";
import { logger } from "../utils/logger.js";

const notFoundHandler = async (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Sökvägen ${req.path} finns inte`,
      status: 404,
    },
  });
};

const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = err instanceof HttpError ? err.status : 500;

  if (status >= 500) {
    logger.error(
      {
        method: req.method,
        path: req.path,
        error: err.message,
      },
      "Request failed",
    );
  }

  res.status(status).json({
    error: {
      code: err instanceof HttpError ? err.code : "INTERNAL_SERVER_ERROR",
      message: err.message || "Något gick fel på servern",
      status,
    },
  });
};

export { errorHandler, notFoundHandler };
