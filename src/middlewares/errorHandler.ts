import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { STATUS } from '../constants/http-status';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    res.status(STATUS.BAD_REQUEST).json({
      error: "Validation error",
      issues: err.issues
    });
    return;
  }

  const message = err instanceof Error ? err.message : "Unexpected error";
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(STATUS.INTERNAL_SERVER_ERROR).json({ error: message });
}
