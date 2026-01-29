import type { Request, Response } from "express";
import {
  PatientCreateWithFileSchema,
  PatientUpdateSchema,
} from "../schemas/patient.schema";
import PatientService from "../services/patient.service";
import { DuplicateFieldError } from '../errors';
import { STATUS } from '../constants/http-status';

export async function listPatients(_req: Request, res: Response) {
  const patients = await PatientService.singleton.listPatients();
  res.json(patients);
}

export async function getPatient(req: Request, res: Response) {
  const patient = await PatientService.singleton.getPatient(req.params.id);
  if (!patient) {
    res.status(STATUS.NOT_FOUND).json({ error: "Patient not found" });
    return;
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const patientWithAbsoluteUrl = PatientService.singleton.getAbsolutePhotoUrl(
    patient,
    baseUrl
  );

  res.json(patientWithAbsoluteUrl);
}

export async function createPatient(req: Request, res: Response) {
  if (!req.file) {
    res.status(STATUS.BAD_REQUEST).json({
      error: "documentPhoto is required",
      message: "Please provide documentPhoto as a file.",
      required: ["name", "email", "phoneNumber", "documentPhoto"],
    });
    return;
  }

  try {
    const input = PatientCreateWithFileSchema.parse({
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
    });

    const documentPhotoUrl = PatientService.singleton.buildFileUrl(
      req.file.filename
    );

    const patient = await PatientService.singleton.createPatient({
      name: input.name,
      email: input.email,
      phoneNumber: input.phoneNumber,
      documentPhotoUrl,
    });

    res.status(STATUS.CREATED).json(patient);
  } catch (error: any) {
    if (error instanceof DuplicateFieldError) {
      res.status(STATUS.CONFLICT).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function updatePatient(req: Request, res: Response) {
  const patient = await PatientService.singleton.getPatient(req.params.id);

  if (!patient) {
    res.status(STATUS.NOT_FOUND).json({ error: "Patient not found" });
    return;
  }

  const bodyData: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    documentPhotoUrl?: string;
  } = { ...req.body };

  if (req.file) {
    const documentPhotoUrl = PatientService.singleton.buildFileUrl(
      req.file.filename
    );
    bodyData.documentPhotoUrl = documentPhotoUrl;
  }

  const input = PatientUpdateSchema.parse(bodyData);

  try {
    const saved = await PatientService.singleton.updatePatient(
      req.params.id,
      input
    );
    res.json(saved);
  } catch (error: any) {
    if (error instanceof DuplicateFieldError) {
      res.status(STATUS.CONFLICT).json({ error: error.message });
      return;
    }
    throw error;
  }
}

export async function deletePatient(req: Request, res: Response) {
  const patient = await PatientService.singleton.getPatient(req.params.id);

  if (!patient) {
    res.status(STATUS.NOT_FOUND).json({ error: "Patient not found" });
    return;
  }

  await PatientService.singleton.deletePatient(req.params.id);
  res.status(STATUS.NO_CONTENT).send();
}