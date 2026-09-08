import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import app from "./app";
import { initContentStore } from "./content/store";
import { logger } from "./lib/logger";
import { connectMongo } from "./lib/mongo";

function loadEnvironment() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  loadEnv({ path: path.resolve(here, "../.env") });
  loadEnv({ path: path.resolve(here, "../../.env") });
}

async function main() {
  loadEnvironment();

  const rawPort = process.env["PORT"];

  if (!rawPort) {
    throw new Error(
      "PORT environment variable is required but was not provided.",
    );
  }

  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  try {
    await connectMongo();
    await initContentStore();
  } catch (err) {
    logger.error({ err }, "Failed to start content store");
    process.exit(1);
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

void main();
