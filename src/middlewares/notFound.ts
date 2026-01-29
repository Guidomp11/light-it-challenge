import type { Request, Response } from "express";
import { STATUS } from '../constants/http-status';

export function notFound(_req: Request, res: Response) {
  res.status(STATUS.NOT_FOUND).json({ error: "Not Found" });
}
