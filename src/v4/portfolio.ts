import { getCollection } from "astro:content";
import type { ImageMetadata } from "astro";

export const sections = ["projects", "activities", "others", "honors"] as const;
export type Section = typeof sections[number];
export interface PortfolioEntry {
  id: string;
  title: string;
  section: Section;
  order: number;
  description: string[];
  links: { label: string; url: string }[];
  logo?: ImageMetadata;
  images: { src: ImageMetadata; alt: string; fit?: "cover" | "contain"; position?: string }[];
}

export async function getPortfolio(): Promise<PortfolioEntry[]> {
  const [activities, showcases, portfolio] = await Promise.all([
    getCollection("activities"), getCollection("showcases"), getCollection("portfolio"),
  ]);
  return [
    ...activities.filter((entry) => entry.data.portfolio).map((entry) => ({
      id: entry.id, ...entry.data.portfolio!,
      images: entry.data.showcase.length ? entry.data.showcase : entry.data.cover
        ? [{ src: entry.data.cover, alt: entry.data.coverAlt ?? entry.data.title }] : [],
    })),
    ...showcases.filter((entry) => entry.data.portfolio).map((entry) => ({
      id: entry.id, ...entry.data.portfolio!, images: entry.data.images,
    })),
    ...portfolio.map((entry) => ({ id: entry.id, ...entry.data })),
  ].sort((a, b) => a.order - b.order);
}

export const sectionUrl = (section: Section) => `/${section}/`;
