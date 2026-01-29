import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./config/env";
import { Patient } from "./entity/Patient";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.name,
  synchronize: env.db.synchronize,
  logging: env.db.logging,
  entities: [Patient]
});


