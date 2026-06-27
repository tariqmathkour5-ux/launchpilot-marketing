import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getCategories, getCategoryBySlug, getTools, getToolsByCategory, getToolBySlug, createTool, getPublishedBlogPosts, getBlogPostBySlug, createContactMessage, getContactMessages } from "./db";
import { importExportRouter } from "./import-export";
import { searchTools, searchInputSchema, getAllFeatures, getPricingModelDistribution, getCategoryStats } from "./search";
import { adminRouter } from "./admin";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Categories router
  categories: router({
    list: publicProcedure.query(async () => {
      return getCategories();
    }),
    
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getCategoryBySlug(input.slug);
      }),
  }),

  // Tools router
  tools: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return getTools(input.limit);
      }),
    
    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return getToolsByCategory(input.categoryId);
      }),
    
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getToolBySlug(input.slug);
      }),
    
    create: protectedProcedure
      .input(z.object({
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
      }))
      .mutation(async ({ input }) => {
        return createTool({
          ...input,
          isVerified: false,
        });
      }),
  }),

  // Blog posts router
  blog: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return getPublishedBlogPosts(input.limit);
      }),
    
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getBlogPostBySlug(input.slug);
      }),
  }),

  // Contact router
  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        return createContactMessage({
          ...input,
          status: "new",
          isSpam: false,
        });
      }),
    
    list: protectedProcedure.query(async () => {
      return getContactMessages();
    }),
  }),

  // Search and Discovery router
  search: router({
    tools: publicProcedure
      .input(searchInputSchema)
      .query(async ({ input }) => {
        return searchTools(input);
      }),
    
    features: publicProcedure.query(async () => {
      return getAllFeatures();
    }),
    
    pricingDistribution: publicProcedure.query(async () => {
      return getPricingModelDistribution();
    }),
    
    categoryStats: publicProcedure.query(async () => {
      return getCategoryStats();
    }),
  }),

  // Import/Export router
  importExport: importExportRouter,

  // Admin router
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
