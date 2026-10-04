import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * One Markdown file per activity, living in src/content/activities/ alongside
 * its images. Adding an activity means adding one file here — no page template
 * needs to change.
 */
const activities = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/activities" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Shown above the title in small caps, e.g. "Conrad Challenge".
      context: z.string(),
      // Used to group entries on the reading-first homepage.
      category: z.string(),
      date: z.date(),
      // One or two sentences, used on the listing page.
      summary: z.string(),
      // Optional while the real photographs are still being gathered. Pages
      // fall back to a plain block so the layout is honest about what is missing.
      cover: image().optional(),
      coverAlt: z.string().optional(),
      // Independent homepage window; photographs remain owned by their activity.
      showcase: z.array(z.object({
        src: image(),
        alt: z.string(),
        fit: z.enum(["cover", "contain"]).default("contain"),
        position: z.string().default("50% 50%"),
      })).default([]),
      // For team projects, state plainly what this person did.
      role: z.string().optional(),
      // Short clip: 20 seconds or less, 10 MB or less, already compressed.
      video: z.string().optional(),
      tags: z.array(z.string()).default([]),
      // Lower numbers appear first on the listing page.
      order: z.number().default(99),
    }),
});

const showcases = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/showcases" }),
  schema: ({ image }) => z.object({
    title: z.string(),
    order: z.number(),
    images: z.array(z.object({
      src: image(),
      alt: z.string(),
      fit: z.enum(["cover", "contain"]).default("contain"),
      position: z.string().default("50% 50%"),
    })).min(1),
  }),
});

export const collections = { activities, showcases };
