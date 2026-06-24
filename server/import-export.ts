import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { tools, categories, blogPosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import Papa from "papaparse";

// Validation schemas
const toolSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  longDescription: z.string().optional(),
  website: z.string().url(),
  logo: z.string().optional(),
  categoryId: z.number(),
  pricingModel: z.enum(["free", "freemium", "paid", "enterprise", "open_source"]),
  tags: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  integrations: z.array(z.string()).default([]),
  apiAvailable: z.boolean().default(false),
  freeTrialDays: z.number().optional(),
});

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

const blogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  featuredImage: z.string().optional(),
  authorId: z.number(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const importExportRouter = router({
  // CSV Import
  importToolsCSV: protectedProcedure
    .input(z.object({ csvData: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results = Papa.parse(input.csvData, {
        header: true,
        skipEmptyLines: true,
      });

      const errors: string[] = [];
      let successCount = 0;

      for (const row of results.data as any[]) {
        try {
          const validated = toolSchema.parse({
            ...row,
            categoryId: parseInt(row.categoryId),
            apiAvailable: row.apiAvailable === "true",
            freeTrialDays: row.freeTrialDays ? parseInt(row.freeTrialDays) : undefined,
            tags: row.tags ? row.tags.split(";") : [],
            features: row.features ? row.features.split(";") : [],
            integrations: row.integrations ? row.integrations.split(";") : [],
          });

          await db.insert(tools).values({
            ...validated,
            isVerified: false,
          });
          successCount++;
        } catch (err: any) {
          errors.push(`Row error: ${err.message}`);
        }
      }

      return { successCount, errors, totalRows: results.data.length };
    }),

  // CSV Export Tools
  exportToolsCSV: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allTools = await db.select().from(tools);

    const csv = Papa.unparse(
      allTools.map((t) => ({
        name: t.name,
        slug: t.slug,
        description: t.description,
        longDescription: t.longDescription,
        website: t.website,
        logo: t.logo,
        categoryId: t.categoryId,
        pricingModel: t.pricingModel,
        tags: Array.isArray(t.tags) ? t.tags.join(";") : "",
        features: Array.isArray(t.features) ? t.features.join(";") : "",
        integrations: Array.isArray(t.integrations) ? t.integrations.join(";") : "",
        apiAvailable: t.apiAvailable,
        freeTrialDays: t.freeTrialDays,
        rating: t.rating,
        reviewCount: t.reviewCount,
        isVerified: t.isVerified,
      }))
    );

    return csv;
  }),

  // CSV Export Categories
  exportCategoriesCSV: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allCategories = await db.select().from(categories);

    const csv = Papa.unparse(
      allCategories.map((c) => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        color: c.color,
        displayOrder: c.displayOrder,
        isActive: c.isActive,
      }))
    );

    return csv;
  }),

  // CSV Export Blog Posts
  exportBlogPostsCSV: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allPosts = await db.select().from(blogPosts);

    const csv = Papa.unparse(
      allPosts.map((p) => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        featuredImage: p.featuredImage,
        authorId: p.authorId,
        tags: Array.isArray(p.tags) ? p.tags.join(";") : "",
        status: p.status,
        publishedAt: p.publishedAt,
        viewCount: p.viewCount,
      }))
    );

    return csv;
  }),

  // JSON Import Tools
  importToolsJSON: protectedProcedure
    .input(z.object({ jsonData: z.array(z.any()) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const errors: string[] = [];
      let successCount = 0;

      for (const item of input.jsonData) {
        try {
          const validated = toolSchema.parse(item);
          await db.insert(tools).values({
            ...validated,
            isVerified: false,
          });
          successCount++;
        } catch (err: any) {
          errors.push(`Item error: ${err.message}`);
        }
      }

      return { successCount, errors, totalItems: input.jsonData.length };
    }),

  // JSON Export All
  exportAllJSON: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [allTools, allCategories, allPosts] = await Promise.all([
      db.select().from(tools),
      db.select().from(categories),
      db.select().from(blogPosts),
    ]);

    return {
      tools: allTools,
      categories: allCategories,
      blogPosts: allPosts,
      exportedAt: new Date().toISOString(),
    };
  }),
});

export type ImportExportRouter = typeof importExportRouter;
