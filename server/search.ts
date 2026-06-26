import { getDb } from "./db";
import { tools, categories } from "../drizzle/schema";
import { sql, and, or, like, eq, inArray } from "drizzle-orm";
import { z } from "zod";

/**
 * Search and filter input schema
 */
export const searchInputSchema = z.object({
  query: z.string().optional(),
  categoryId: z.number().optional(),
  pricingModels: z.array(z.enum(["free", "freemium", "paid", "enterprise", "open_source"])).optional(),
  features: z.array(z.string()).optional(),
  sortBy: z.enum(["newest", "popularity", "alphabetical", "rating"]).default("newest"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type SearchInput = z.infer<typeof searchInputSchema>;

/**
 * Search result with pagination metadata
 */
export interface SearchResult {
  tools: typeof tools.$inferSelect[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Full-text search and filter tools
 */
export async function searchTools(input: SearchInput): Promise<SearchResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const { query, categoryId, pricingModels, features, sortBy, page, limit } = input;
  const offset = (page - 1) * limit;

  // Build WHERE conditions
  const conditions: any[] = [];

  // Full-text search on name and description
  if (query && query.trim()) {
    const searchTerm = `%${query.trim()}%`;
    conditions.push(
      or(
        like(tools.name, searchTerm),
        like(tools.description, searchTerm),
        like(tools.longDescription, searchTerm)
      )
    );
  }

  // Filter by category
  if (categoryId) {
    conditions.push(eq(tools.categoryId, categoryId));
  }

  // Filter by pricing models
  if (pricingModels && pricingModels.length > 0) {
    conditions.push(inArray(tools.pricingModel, pricingModels));
  }

  // Filter by features (JSON array contains)
  if (features && features.length > 0) {
    // For each feature, add a condition checking if it's in the features array
    const featureConditions = features.map(feature =>
      sql`JSON_CONTAINS(${tools.features}, JSON_QUOTE(${feature}))`
    );
    conditions.push(or(...featureConditions));
  }

  // Only show verified tools
  conditions.push(eq(tools.isVerified, true));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(tools)
    .where(whereClause);

  const total = countResult[0]?.count || 0;

  // Determine sort order
  let orderByClause: any;
  switch (sortBy) {
    case "popularity":
      orderByClause = sql`${tools.monthlyUsers} DESC NULLS LAST, ${tools.rating} DESC`;
      break;
    case "alphabetical":
      orderByClause = sql`${tools.name} ASC`;
      break;
    case "rating":
      orderByClause = sql`${tools.rating} DESC, ${tools.reviewCount} DESC`;
      break;
    case "newest":
    default:
      orderByClause = sql`${tools.createdAt} DESC`;
      break;
  }

  // Get paginated results
  const results = await db
    .select()
    .from(tools)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    tools: results,
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}

/**
 * Get tools by category with pagination
 */
export async function getToolsByCategoryPaginated(
  categoryId: number,
  page: number = 1,
  limit: number = 20
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const offset = (page - 1) * limit;

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(tools)
    .where(and(eq(tools.categoryId, categoryId), eq(tools.isVerified, true)));

  const total = countResult[0]?.count || 0;

  const results = await db
    .select()
    .from(tools)
    .where(and(eq(tools.categoryId, categoryId), eq(tools.isVerified, true)))
    .orderBy(sql`${tools.createdAt} DESC`)
    .limit(limit)
    .offset(offset);

  const totalPages = Math.ceil(total / limit);

  return {
    tools: results,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Get all unique features across tools
 */
export async function getAllFeatures(): Promise<string[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const results = await db
    .select({ features: tools.features })
    .from(tools)
    .where(eq(tools.isVerified, true));

  const uniqueFeatures = new Set<string>();
  results.forEach(row => {
    if (Array.isArray(row.features)) {
      row.features.forEach(feature => uniqueFeatures.add(feature));
    }
  });

  return Array.from(uniqueFeatures).sort();
}

/**
 * Get pricing model distribution
 */
export async function getPricingModelDistribution() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const results = await db
    .select({
      pricingModel: tools.pricingModel,
      count: sql<number>`count(*)`,
    })
    .from(tools)
    .where(eq(tools.isVerified, true))
    .groupBy(tools.pricingModel);

  return results;
}

/**
 * Get category statistics
 */
export async function getCategoryStats() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const results = await db
    .select({
      categoryId: tools.categoryId,
      count: sql<number>`count(*)`,
      avgRating: sql<number>`AVG(${tools.rating})`,
    })
    .from(tools)
    .where(eq(tools.isVerified, true))
    .groupBy(tools.categoryId);

  return results;
}
