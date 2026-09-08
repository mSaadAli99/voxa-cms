import { MongoClient, type Db } from "mongodb";
import { logger } from "./logger";

let client: MongoClient | null = null;
let db: Db | null = null;

export function getMongoDb(): Db | null {
  return db;
}

export function isMongoEnabled(): boolean {
  return Boolean(process.env["MONGODB_URI"]);
}

export async function connectMongo(): Promise<Db | null> {
  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    logger.warn(
      "MONGODB_URI is not set; content will stay in memory and reset on restart",
    );
    return null;
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(process.env["MONGODB_DB"] || "voxa-cms");
  await db.command({ ping: 1 });
  logger.info({ database: db.databaseName }, "Connected to MongoDB");
  return db;
}

export async function disconnectMongo(): Promise<void> {
  await client?.close();
  client = null;
  db = null;
}
