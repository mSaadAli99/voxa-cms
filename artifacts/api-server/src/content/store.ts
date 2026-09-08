import { logger } from "../lib/logger";
import { getMongoDb } from "../lib/mongo";
import { createMemoryStore } from "./memory-store";
import { createMongoStore } from "./mongo-store";
import type { ContentStore } from "./types";

let store: ContentStore | null = null;

export async function initContentStore(): Promise<ContentStore> {
  const db = getMongoDb();
  store = db ? await createMongoStore(db) : createMemoryStore();
  logger.info(
    { persistence: db ? "mongodb" : "memory" },
    "Content store ready",
  );
  return store;
}

export function getStore(): ContentStore {
  if (!store) {
    throw new Error("Content store is not initialized");
  }
  return store;
}
