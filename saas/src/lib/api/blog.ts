import { z } from "zod";
import { api } from "./client";

// ── Public Blog Types ─────────────────────────────────
export const PublicPostSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  author: z.string(),
  published_at: z.string(),
  reading_time_min: z.number(),
  cover_image: z.string().nullable(),
});
export type PublicPostSummary = z.infer<typeof PublicPostSummarySchema>;

export const HeadingSchema = z.object({
  id: z.string(),
  text: z.string(),
  level: z.number(),
});

export const PublicPostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  author: z.string(),
  published_at: z.string(),
  reading_time_min: z.number(),
  cover_image: z.string().nullable(),
  html_content: z.string(),
  headings: z.array(HeadingSchema),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  related_slugs: z.array(z.string()),
});
export type PublicPost = z.infer<typeof PublicPostSchema>;

export const BlogIndexSchema = z.object({
  posts: z.array(PublicPostSummarySchema),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
});
export type BlogIndex = z.infer<typeof BlogIndexSchema>;

export const BlogSlugsSchema = z.array(z.string());

// ── API ───────────────────────────────────────────────
export const blogApi = {
  getIndex: (params?: string) =>
    api.get(`/public/blog${params ? `?${params}` : ""}`, BlogIndexSchema),
  getPost: (slug: string) => api.get(`/public/blog/${slug}`, PublicPostSchema),
  getSlugs: () => api.get("/public/blog/slugs", BlogSlugsSchema),
};
