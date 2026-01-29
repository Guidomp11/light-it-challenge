import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  
  // Database
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  DB_NAME: z.string().default("patient_registration"),
  DB_SYNCHRONIZE: z.enum(["true", "false"]).default("false"),
  DB_LOGGING: z.enum(["true", "false"]).default("false"),
  
  // Redis
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  
  // Nodemailer
  MAILTRAP_HOST: z.string(),
  MAILTRAP_PORT: z.coerce.number(),
  MAILTRAP_USER: z.string(),
  MAILTRAP_PASS: z.string(),
});

const envVars = envSchema.parse(process.env);

export const env = {
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  db: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    username: envVars.DB_USERNAME,
    password: envVars.DB_PASSWORD,
    name: envVars.DB_NAME,
    synchronize: envVars.DB_SYNCHRONIZE === "true",
    logging: envVars.DB_LOGGING === "true"
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
  },
  mailtrap: {
    host: envVars.MAILTRAP_HOST,
    port: envVars.MAILTRAP_PORT,
    user: envVars.MAILTRAP_USER,
    pass: envVars.MAILTRAP_PASS,
  },
};


