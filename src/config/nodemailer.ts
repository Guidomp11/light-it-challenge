import nodemailer from "nodemailer";
import { env } from "./env";

export const transporter = nodemailer.createTransport({
  host: env.mailtrap.host,
  port: env.mailtrap.port,
  auth: {
    user: env.mailtrap.user,
    pass: env.mailtrap.pass,
  },
});
