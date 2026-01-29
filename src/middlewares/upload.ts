import type { Request, Response, NextFunction } from "express";
import {
  uploadDocumentPhoto
} from "../config/multer";
import { STATUS } from '../constants/http-status';

function handleUpload(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  uploadDocumentPhoto(req, res, (err) => {
    if (err) {
      if (err instanceof Error) {
        return res.status(STATUS.BAD_REQUEST).json({ error: err.message });
      }
      return res.status(STATUS.BAD_REQUEST).json({ error: "File upload error" });
    }
    next();
  });
}

export { handleUpload };