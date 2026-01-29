import { Router } from "express";
import { patientsRouter } from "./patients.router";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});

apiRouter.use("/patients", patientsRouter);
