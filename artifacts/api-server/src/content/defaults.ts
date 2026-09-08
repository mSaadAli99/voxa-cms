import type { Hero, Media, Product, Section, Solution } from "./types";

export const now = () => new Date().toISOString();

export const defaultHero: Hero = {
  id: "hero-1",
  label: "THE OPERATING SYSTEM FOR MODERN WORK",
  title: "Build momentum, not busywork.",
  subtitle:
    "VOXA brings your people, projects, and most important work into one clear view.",
  ctaText: "Explore VOXA",
  ctaUrl: "/platform",
  imageUrl:
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=85",
  updatedAt: now(),
};

export const defaultProducts: Product[] = [
  {
    id: "product-1",
    name: "VOXA Core",
    description: "One intelligent home for your most important work.",
    longDescription:
      "Bring planning, collaboration, and progress into a shared operating rhythm that keeps teams moving forward.",
    imageUrl:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=85",
    order: 1,
    ctaText: "View platform",
    ctaUrl: "/platform",
    updatedAt: now(),
  },
  {
    id: "product-2",
    name: "VOXA Signals",
    description: "The context you need to make better decisions faster.",
    longDescription:
      "Surface the patterns, blockers, and opportunities hidden across your organization.",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=85",
    order: 2,
    ctaText: "See signals",
    ctaUrl: "/signals",
    updatedAt: now(),
  },
  {
    id: "product-3",
    name: "VOXA Studio",
    description: "Turn ideas into outcomes with a calmer creative process.",
    longDescription:
      "Give every team a thoughtful space to shape, review, and ship the work that defines your next chapter.",
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=85",
    order: 3,
    ctaText: "Meet Studio",
    ctaUrl: "/studio",
    updatedAt: now(),
  },
];

export const defaultSolutions: Solution[] = [
  {
    id: "solution-1",
    name: "For growing teams",
    description: "Replace scattered tools with a shared source of momentum.",
    imageUrl:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85",
    order: 1,
    updatedAt: now(),
  },
  {
    id: "solution-2",
    name: "For operations leaders",
    description: "Create the visibility and rhythm that makes scale feel simple.",
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=85",
    order: 2,
    updatedAt: now(),
  },
];

export const defaultSections: Section[] = [
  {
    id: "section-1",
    name: "Manifesto",
    title: "The future belongs to teams in motion.",
    description:
      "VOXA gives ambitious people the clarity to move from intention to impact.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
    videoUrl: "",
    order: 1,
    updatedAt: now(),
  },
  {
    id: "section-2",
    name: "Proof",
    title: "Less coordination. More creation.",
    description:
      "A calmer operating system creates space for better work, better decisions, and better days.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
    videoUrl: "",
    order: 2,
    updatedAt: now(),
  },
];

export const defaultMedia: Media[] = [
  {
    id: "media-1",
    name: "team-collaboration.jpg",
    type: "image",
    url: defaultHero.imageUrl,
    size: "2.4 MB",
    createdAt: now(),
  },
  {
    id: "media-2",
    name: "workspace-overview.jpg",
    type: "image",
    url: defaultSections[0].imageUrl,
    size: "1.8 MB",
    createdAt: now(),
  },
  {
    id: "media-3",
    name: "voxa-intro.mp4",
    type: "video",
    url: "https://cdn.coverr.co/videos/coverr-a-team-working-together-1577/1080p.mp4",
    size: "12.6 MB",
    createdAt: now(),
  },
];
