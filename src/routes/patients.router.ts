import { Router } from "express";
import {
  createPatient,
  deletePatient,
  getPatient,
  listPatients,
  updatePatient,
} from "../controllers/patient.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { handleUpload } from '../middlewares/upload';

export const patientsRouter = Router();

patientsRouter.get("/", asyncHandler(listPatients));
patientsRouter.get("/:id", asyncHandler(getPatient));

patientsRouter.post(
  "/",
  handleUpload,
  asyncHandler(createPatient)
);

patientsRouter.put(
  "/:id",
  handleUpload,
  asyncHandler(updatePatient)
);

patientsRouter.delete("/:id", asyncHandler(deletePatient));
