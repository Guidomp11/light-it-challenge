import { Patient } from "../entity/Patient";
import { BaseRepository } from "../libs/repository";
import fs from "fs";
import path from "path";
import { AppDataSource } from "../data-source";
import { DuplicateFieldError } from '../errors';
import { addEmailToQueue } from "../libs/queues/emailQueue";

interface PatientInput {
  name?: string;
  email?: string;
  phoneNumber?: string;
  documentPhotoUrl?: string;
}

interface PatientCreateInput extends PatientInput {
  name: string;
  email: string;
  phoneNumber: string;
  documentPhotoUrl: string;
}

export default class PatientService extends BaseRepository<Patient> {
  public static singleton = new PatientService();

  constructor() {
    super(AppDataSource.getRepository(Patient));
  }

  public async listPatients() {
    return this.findAll(undefined, { createdAt: "DESC" });
  }

  public async getPatient(id: string) {
    return this.findById(id);
  }

  public getAbsolutePhotoUrl(patient: Patient, baseUrl: string): Patient {
    return {
      ...patient,
      documentPhotoUrl: `${baseUrl}${patient.documentPhotoUrl}`,
    };
  }

  public buildFileUrl(filename: string): string {
    return `/uploads/documents/${filename}`;
  }

  public async createPatient(input: PatientCreateInput) {
    try {
      const patient = await this.create(input);

      addEmailToQueue(
        patient.email,
        patient.name,
        `Welcome ${patient.name}! Your registration has been confirmed. We'll be in touch shortly.`
      ).catch((error) => {
        console.error("Failed to queue confirmation email:", error);
      });

      return patient;
    } catch (error: any) {
      this.checkDuplicationFieldError(error);
      throw error;
    }
  }

  public async updatePatient(id: string, input: PatientInput) {
    const patient = await this.findById(id);
    if (!patient) return null;

    let newPhotoUrl: string | undefined;

    if (input.documentPhotoUrl) {
      newPhotoUrl = input.documentPhotoUrl;
      if (patient.documentPhotoUrl) {
        this.deleteFile(patient.documentPhotoUrl);
      }
    }

    Object.assign(patient, {
      ...(input.name && { name: input.name }),
      ...(input.email && { email: input.email }),
      ...(input.phoneNumber && { phoneNumber: input.phoneNumber }),
      ...(newPhotoUrl && { documentPhotoUrl: newPhotoUrl }),
    });

    try {
      return await this.update(id, patient);
    } catch (error: any) {
      this.checkDuplicationFieldError(error);
      throw error;
    }
  }

  public async deletePatient(id: string) {
    const patient = await this.findById(id);
    if (!patient) return null;

    if (patient.documentPhotoUrl?.startsWith("/uploads/documents/")) {
      this.deleteFile(patient.documentPhotoUrl);
    }

    return this.delete(id);
  }

  private deleteFile(photoUrl: string): void {
    try {
      const filename = photoUrl.split("/").pop();
      if (filename) {
        const filePath = path.join("uploads/documents", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }

  private checkDuplicationFieldError(error: any): void {
    if (error?.code === "23505") {
      throw new DuplicateFieldError('Registration could not be completed');
    }
  }
}