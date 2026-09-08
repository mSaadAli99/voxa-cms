export type Hero = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  order: number;
  ctaText: string;
  ctaUrl: string;
  updatedAt: string;
};

export type Solution = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  order: number;
  updatedAt: string;
};

export type Section = {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  order: number;
  updatedAt: string;
};

export type Media = {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  size: string;
  createdAt: string;
};

export type ContentBundle = {
  hero: Hero;
  products: Product[];
  solutions: Solution[];
  sections: Section[];
  media: Media[];
};

export type ContentSummary = {
  products: number;
  solutions: number;
  sections: number;
  media: number;
  lastUpdated: string;
};

export type ContentStore = {
  getSummary(): Promise<ContentSummary>;
  getAll(): Promise<ContentBundle>;
  getHero(): Promise<Hero>;
  updateHero(body: Partial<Omit<Hero, "id" | "updatedAt">>): Promise<Hero>;
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(body: Omit<Product, "id" | "updatedAt">): Promise<Product>;
  updateProduct(
    id: string,
    body: Partial<Omit<Product, "id" | "updatedAt">>,
  ): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
  listSolutions(): Promise<Solution[]>;
  getSolution(id: string): Promise<Solution | null>;
  createSolution(body: Omit<Solution, "id" | "updatedAt">): Promise<Solution>;
  updateSolution(
    id: string,
    body: Partial<Omit<Solution, "id" | "updatedAt">>,
  ): Promise<Solution | null>;
  deleteSolution(id: string): Promise<boolean>;
  listSections(): Promise<Section[]>;
  getSection(id: string): Promise<Section | null>;
  createSection(body: Omit<Section, "id" | "updatedAt">): Promise<Section>;
  updateSection(
    id: string,
    body: Partial<Omit<Section, "id" | "updatedAt">>,
  ): Promise<Section | null>;
  deleteSection(id: string): Promise<boolean>;
  listMedia(): Promise<Media[]>;
  createMedia(asset: Media): Promise<Media>;
  deleteMedia(id: string): Promise<boolean>;
};
