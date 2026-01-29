import fs from "fs";
import path from "path";
import { createApp } from "./app";
import { env } from "./config/env";
import { AppDataSource } from "./data-source";
import { emailQueue } from "./libs/queues/emailQueue";

async function main() {
  const uploadsDir = path.join(process.cwd(), "uploads", "documents");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  await AppDataSource.initialize();

  // Initialize Bull queue
  console.log("🚀 Starting email queue processor...");
  await emailQueue.isReady();

  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.port}`);
    console.log(`📧 Email queue ready (Redis: ${env.redis.host}:${env.redis.port})`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal error during startup:", err);
  process.exit(1);
});


