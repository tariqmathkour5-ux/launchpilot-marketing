import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { tools, categories, blogPosts, contactMessages, users } from "../drizzle/schema";
import { eq, desc, like } from "drizzle-orm";
import { z } from "zod";

/**
 * Admin-only procedure that checks user role
 */
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to access this resource",
    });
  }
  return next({ ctx });
});

/**
 * Admin dashboard and management procedures
 */
export const adminRouter = router({
  dashboard: router({
    stats: adminProcedure.query(async () => {
      return {
        tools: 100,
        categories: 5,
        users: 1,
        messages: 0,
        posts: 0,
      };
    }),
  }),

  tools: router({
    list: adminProcedure
      .input(
        z.object({
          page: z.number().int().positive().default(1),
          limit: z.number().int().min(1).max(100).default(20),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const { page, limit, search } = input;
        const offset = (page - 1) * limit;

        let baseQuery: any = db.select().from(tools);

        if (search) {
          baseQuery = baseQuery.where(like(tools.name, `%${search}%`));
        }

        const data = await baseQuery
          .orderBy(desc(tools.createdAt))
          .limit(limit)
          .offset(offset);

        const total = data.length;

        return {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().min(1),
          website: z.string().url(),
          categoryId: z.number(),
          pricingModel: z.enum(["free", "freemium", "paid", "enterprise", "open_source"]),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db.insert(tools).values({
          name: input.name,
          slug: input.slug,
          description: input.description,
          longDescription: input.description,
          website: input.website,
          categoryId: input.categoryId,
          pricingModel: input.pricingModel,
          isVerified: true,
        });

        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          website: z.string().url().optional(),
          categoryId: z.number().optional(),
          pricingModel: z.enum(["free", "freemium", "paid", "enterprise", "open_source"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const { id, ...data } = input;
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.description) updateData.description = data.description;
        if (data.website) updateData.website = data.website;
        if (data.categoryId) updateData.categoryId = data.categoryId;
        if (data.pricingModel) updateData.pricingModel = data.pricingModel;

        await db.update(tools).set(updateData).where(eq(tools.id, id));

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db.delete(tools).where(eq(tools.id, input.id));

        return { success: true };
      }),
  }),

  categories: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      return await db.select().from(categories).orderBy(desc(categories.createdAt));
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db.insert(categories).values({
          name: input.name,
          slug: input.slug,
          description: input.description,
        });

        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const { id, ...data } = input;
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.description) updateData.description = data.description;

        await db.update(categories).set(updateData).where(eq(categories.id, id));

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db.delete(categories).where(eq(categories.id, input.id));

        return { success: true };
      }),
  }),

  users: router({
    list: adminProcedure
      .input(
        z.object({
          page: z.number().int().positive().default(1),
          limit: z.number().int().min(1).max(100).default(20),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const { page, limit } = input;
        const offset = (page - 1) * limit;

        const data = await db
          .select()
          .from(users)
          .orderBy(desc(users.lastSignedIn))
          .limit(limit)
          .offset(offset);

        const total = data.length;

        return {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }),

    updateRole: adminProcedure
      .input(
        z.object({
          id: z.number(),
          role: z.enum(["user", "admin"]),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));

        return { success: true };
      }),
  }),

  messages: router({
    list: adminProcedure
      .input(
        z.object({
          page: z.number().int().positive().default(1),
          limit: z.number().int().min(1).max(100).default(20),
          status: z.enum(["new", "read", "replied", "archived"]).optional(),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const { page, limit, status } = input;
        const offset = (page - 1) * limit;

        let baseQuery: any = db.select().from(contactMessages);

        if (status) {
          baseQuery = baseQuery.where(eq(contactMessages.status, status));
        }

        const data = await baseQuery
          .orderBy(desc(contactMessages.createdAt))
          .limit(limit)
          .offset(offset);

        const total = data.length;

        return {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "read", "replied", "archived"]),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db.update(contactMessages).set({ status: input.status }).where(eq(contactMessages.id, input.id));

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db.delete(contactMessages).where(eq(contactMessages.id, input.id));

        return { success: true };
      }),
  }),

  posts: router({
    list: adminProcedure
      .input(
        z.object({
          page: z.number().int().positive().default(1),
          limit: z.number().int().min(1).max(20).default(10),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const { page, limit } = input;
        const offset = (page - 1) * limit;

        const data = await db
          .select()
          .from(blogPosts)
          .orderBy(desc(blogPosts.createdAt))
          .limit(limit)
          .offset(offset);

        const total = data.length;

        return {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }),

    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1),
          slug: z.string().min(1),
          content: z.string().min(1),
          status: z.enum(["draft", "published", "archived"]).default("draft"),
          authorId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db.insert(blogPosts).values({
          title: input.title,
          slug: input.slug,
          content: input.content,
          status: input.status,
          authorId: input.authorId,
        });

        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          content: z.string().optional(),
          status: z.enum(["draft", "published", "archived"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const { id, title, content, status } = input;
        const updateData: any = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (status) updateData.status = status;

        await db.update(blogPosts).set(updateData).where(eq(blogPosts.id, id));

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db.delete(blogPosts).where(eq(blogPosts.id, input.id));

        return { success: true };
      }),
  }),
});
