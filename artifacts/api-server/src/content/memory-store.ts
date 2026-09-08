import { defaultHero, defaultMedia, defaultProducts, defaultSections, defaultSolutions, now } from "./defaults";
import type {
  ContentStore,
  Hero,
  Media,
  Product,
  Section,
  Solution,
} from "./types";

function summaryFrom(
  hero: Hero,
  products: Product[],
  solutions: Solution[],
  sections: Section[],
  media: Media[],
) {
  return {
    products: products.length,
    solutions: solutions.length,
    sections: sections.length,
    media: media.length,
    lastUpdated:
      [hero, ...products, ...solutions, ...sections]
        .map((item) => item.updatedAt)
        .sort()
        .at(-1) ?? now(),
  };
}

export function createMemoryStore(): ContentStore {
  let hero: Hero = { ...defaultHero };
  let products: Product[] = defaultProducts.map((item) => ({ ...item }));
  let solutions: Solution[] = defaultSolutions.map((item) => ({ ...item }));
  let sections: Section[] = defaultSections.map((item) => ({ ...item }));
  let media: Media[] = defaultMedia.map((item) => ({ ...item }));

  return {
    async getSummary() {
      return summaryFrom(hero, products, solutions, sections, media);
    },
    async getAll() {
      return { hero, products, solutions, sections, media };
    },
    async getHero() {
      return hero;
    },
    async updateHero(body) {
      hero = { ...hero, ...body, updatedAt: now() };
      return hero;
    },
    async listProducts() {
      return [...products].sort((a, b) => a.order - b.order);
    },
    async getProduct(id) {
      return products.find((item) => item.id === id) ?? null;
    },
    async createProduct(body) {
      const product: Product = {
        ...body,
        id: `product-${Date.now()}`,
        updatedAt: now(),
      };
      products = [...products, product];
      return product;
    },
    async updateProduct(id, body) {
      const index = products.findIndex((item) => item.id === id);
      if (index === -1) return null;
      products[index] = { ...products[index], ...body, updatedAt: now() };
      return products[index];
    },
    async deleteProduct(id) {
      const before = products.length;
      products = products.filter((item) => item.id !== id);
      return products.length !== before;
    },
    async listSolutions() {
      return [...solutions].sort((a, b) => a.order - b.order);
    },
    async getSolution(id) {
      return solutions.find((item) => item.id === id) ?? null;
    },
    async createSolution(body) {
      const solution: Solution = {
        ...body,
        id: `solution-${Date.now()}`,
        updatedAt: now(),
      };
      solutions = [...solutions, solution];
      return solution;
    },
    async updateSolution(id, body) {
      const index = solutions.findIndex((item) => item.id === id);
      if (index === -1) return null;
      solutions[index] = { ...solutions[index], ...body, updatedAt: now() };
      return solutions[index];
    },
    async deleteSolution(id) {
      const before = solutions.length;
      solutions = solutions.filter((item) => item.id !== id);
      return solutions.length !== before;
    },
    async listSections() {
      return [...sections].sort((a, b) => a.order - b.order);
    },
    async getSection(id) {
      return sections.find((item) => item.id === id) ?? null;
    },
    async createSection(body) {
      const section: Section = {
        ...body,
        id: `section-${Date.now()}`,
        updatedAt: now(),
      };
      sections = [...sections, section];
      return section;
    },
    async updateSection(id, body) {
      const index = sections.findIndex((item) => item.id === id);
      if (index === -1) return null;
      sections[index] = { ...sections[index], ...body, updatedAt: now() };
      return sections[index];
    },
    async deleteSection(id) {
      const before = sections.length;
      sections = sections.filter((item) => item.id !== id);
      return sections.length !== before;
    },
    async listMedia() {
      return media;
    },
    async createMedia(asset) {
      media = [asset, ...media];
      return asset;
    },
    async deleteMedia(id) {
      const before = media.length;
      media = media.filter((item) => item.id !== id);
      return media.length !== before;
    },
  };
}
