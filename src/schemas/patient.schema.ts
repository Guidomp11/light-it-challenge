import { z } from "zod";

const DocumentPhotoUrlSchema = z
  .string()
  .max(500)
  .regex(/^\/uploads\/documents\/[^\/]+$/, "Invalid document photo path");

const PatientBaseSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(255),
  phoneNumber: z
    .string()
    .min(1)
    .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format")
    .max(20)
});

export const PatientCreateSchema = PatientBaseSchema.extend({
  documentPhotoUrl: DocumentPhotoUrlSchema
});

export const PatientCreateWithFileSchema = PatientBaseSchema;

export const PatientUpdateSchema = PatientCreateSchema.partial();
export type PatientUpdateInput = z.infer<typeof PatientUpdateSchema>;
