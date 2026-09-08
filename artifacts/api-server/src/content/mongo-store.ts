import type { Collection, Db } from "mongodb";
import { logger } from "../lib/logger";
import {
  defaultHero,
  defaultMedia,
  defaultProducts,
  defaultSections,
  defaultSolutions,
  now,
} from "./defaults";
import type {
  ContentStore,
  Hero,
  Media,
  Product,
  Section,
  Solution,
} from "./types";

type Doc<T extends { id: string }> = Omit<T, "id"> & { _id: string };

function toDoc<T extends { id: string }>(item: T): Doc<T> {
  const { id, ...rest } = item;
  return { _id: id, ...rest };
}

function fromDoc<T extends { id: string }>(
  doc: Doc<T> | null | undefined,
): T | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id, ...rest } as unknown as T;
}

async function seedIfEmpty(db: Db) {
  const hero = db.collection<Doc<Hero>>("hero");
  const products = db.collection<Doc<Product>>("products");
  const solutions = db.collection<Doc<Solution>>("solutions");
  const sections = db.collection<Doc<Section>>("sections");
  const media = db.collection<Doc<Media>>("media");

  const [heroCount, productCount] = await Promise.all([
    hero.countDocuments(),
    products.countDocuments(),
  ]);

  if (heroCount === 0 && productCount === 0) {
    await Promise.all([
      hero.insertOne(toDoc(defaultHero)),
      products.insertMany(defaultProducts.map(toDoc)),
      solutions.insertMany(defaultSolutions.map(toDoc)),
      sections.insertMany(defaultSections.map(toDoc)),
      media.insertMany(defaultMedia.map(toDoc)),
    ]);
    logger.info("Seeded MongoDB with default VOXA content");
  }

  await Promise.all([
    products.createIndex({ order: 1 }),
    solutions.createIndex({ order: 1 }),
    sections.createIndex({ order: 1 }),
    media.createIndex({ createdAt: -1 }),
  ]);
}

async function getSingletonHero(col: Collection<Doc<Hero>>): Promise<Hero> {
  const existing = fromDoc<Hero>(await col.findOne({ _id: defaultHero.id }));
  if (existing) return existing;
  const fallback = fromDoc<Hero>(await col.findOne({}));
  if (fallback) return fallback;
  await col.insertOne(toDoc(defaultHero));
  return defaultHero;
}

export async function createMongoStore(db: Db): Promise<ContentStore> {
  await seedIfEmpty(db);

  const heroCol = db.collection<Doc<Hero>>("hero");
  const productsCol = db.collection<Doc<Product>>("products");
  const solutionsCol = db.collection<Doc<Solution>>("solutions");
  const sectionsCol = db.collection<Doc<Section>>("sections");
  const mediaCol = db.collection<Doc<Media>>("media");

  return {
    async getSummary() {
      const [hero, products, solutions, sections, media] = await Promise.all([
        getSingletonHero(heroCol),
        productsCol.find().toArray(),
        solutionsCol.find().toArray(),
        sectionsCol.find().toArray(),
        mediaCol.countDocuments(),
      ]);
      const dated = [
        hero,
        ...products.map((item) => fromDoc<Product>(item)!),
        ...solutions.map((item) => fromDoc<Solution>(item)!),
        ...sections.map((item) => fromDoc<Section>(item)!),
      ];
      return {
        products: products.length,
        solutions: solutions.length,
        sections: sections.length,
        media,
        lastUpdated:
          dated
            .map((item) => item.updatedAt)
            .sort()
            .at(-1) ?? now(),
      };
    },
    async getAll() {
      const [hero, products, solutions, sections, media] = await Promise.all([
        getSingletonHero(heroCol),
        productsCol.find().sort({ order: 1 }).toArray(),
        solutionsCol.find().sort({ order: 1 }).toArray(),
        sectionsCol.find().sort({ order: 1 }).toArray(),
        mediaCol.find().sort({ createdAt: -1 }).toArray(),
      ]);
      return {
        hero,
        products: products.map((item) => fromDoc<Product>(item)!),
        solutions: solutions.map((item) => fromDoc<Solution>(item)!),
        sections: sections.map((item) => fromDoc<Section>(item)!),
        media: media.map((item) => fromDoc<Media>(item)!),
      };
    },
    async getHero() {
      return getSingletonHero(heroCol);
    },
    async updateHero(body) {
      const current = await getSingletonHero(heroCol);
      const next: Hero = { ...current, ...body, updatedAt: now() };
      await heroCol.replaceOne({ _id: next.id }, toDoc(next), { upsert: true });
      return next;
    },
    async listProducts() {
      const rows = await productsCol.find().sort({ order: 1 }).toArray();
      return rows.map((item) => fromDoc<Product>(item)!);
    },
    async getProduct(id) {
      return fromDoc<Product>(await productsCol.findOne({ _id: id }));
    },
    async createProduct(body) {
      const product: Product = {
        ...body,
        id: `product-${Date.now()}`,
        updatedAt: now(),
      };
      await productsCol.insertOne(toDoc(product));
      return product;
    },
    async updateProduct(id, body) {
      const current = fromDoc<Product>(await productsCol.findOne({ _id: id }));
      if (!current) return null;
      const next: Product = { ...current, ...body, updatedAt: now() };
      await productsCol.replaceOne({ _id: id }, toDoc(next));
      return next;
    },
    async deleteProduct(id) {
      const result = await productsCol.deleteOne({ _id: id });
      return result.deletedCount === 1;
    },
    async listSolutions() {
      const rows = await solutionsCol.find().sort({ order: 1 }).toArray();
      return rows.map((item) => fromDoc<Solution>(item)!);
    },
    async getSolution(id) {
      return fromDoc<Solution>(await solutionsCol.findOne({ _id: id }));
    },
    async createSolution(body) {
      const solution: Solution = {
        ...body,
        id: `solution-${Date.now()}`,
        updatedAt: now(),
      };
      await solutionsCol.insertOne(toDoc(solution));
      return solution;
    },
    async updateSolution(id, body) {
      const current = fromDoc<Solution>(await solutionsCol.findOne({ _id: id }));
      if (!current) return null;
      const next: Solution = { ...current, ...body, updatedAt: now() };
      await solutionsCol.replaceOne({ _id: id }, toDoc(next));
      return next;
    },
    async deleteSolution(id) {
      const result = await solutionsCol.deleteOne({ _id: id });
      return result.deletedCount === 1;
    },
    async listSections() {
      const rows = await sectionsCol.find().sort({ order: 1 }).toArray();
      return rows.map((item) => fromDoc<Section>(item)!);
    },
    async getSection(id) {
      return fromDoc<Section>(await sectionsCol.findOne({ _id: id }));
    },
    async createSection(body) {
      const section: Section = {
        ...body,
        id: `section-${Date.now()}`,
        updatedAt: now(),
      };
      await sectionsCol.insertOne(toDoc(section));
      return section;
    },
    async updateSection(id, body) {
      const current = fromDoc<Section>(await sectionsCol.findOne({ _id: id }));
      if (!current) return null;
      const next: Section = { ...current, ...body, updatedAt: now() };
      await sectionsCol.replaceOne({ _id: id }, toDoc(next));
      return next;
    },
    async deleteSection(id) {
      const result = await sectionsCol.deleteOne({ _id: id });
      return result.deletedCount === 1;
    },
    async listMedia() {
      const rows = await mediaCol.find().sort({ createdAt: -1 }).toArray();
      return rows.map((item) => fromDoc<Media>(item)!);
    },
    async createMedia(asset) {
      await mediaCol.insertOne(toDoc(asset));
      return asset;
    },
    async deleteMedia(id) {
      const result = await mediaCol.deleteOne({ _id: id });
      return result.deletedCount === 1;
    },
  };
}
