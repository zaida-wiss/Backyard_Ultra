import type { NextFunction, Request, Response } from "express";
import HttpError from "../utils/httpError";

export const notFoundHandler = async (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Sökvägen ${req.path} finns inte`,
      status: 404,
    },
  });
};

export const errorHandler = async (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = err instanceof HttpError ? err.status : 500;

  res.status(status).json({
    error: {
      code: err instanceof HttpError ? err.code : 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Något gick fel på servern',
      status,
    },
  });
};
