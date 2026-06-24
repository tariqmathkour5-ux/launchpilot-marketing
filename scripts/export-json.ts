import { getDb } from '../server/db';
import { tools, categories } from '../drizzle/schema';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    process.exit(1);
  }

  try {
    // Fetch all tools with category names
    const allTools = await db.select().from(tools);
    const allCategories = await db.select().from(categories);
    
    const categoryMap = new Map(allCategories.map(c => [c.id, c.name]));

    // Transform tools to include category name
    const toolsWithCategories = allTools.map(tool => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      website: tool.website,
      category: categoryMap.get(tool.categoryId) || 'Unknown',
      pricingModel: tool.pricingModel,
      isVerified: tool.isVerified,
      rating: tool.rating,
      features: tool.features,
      integrations: tool.integrations,
      apiAvailable: tool.apiAvailable,
      createdAt: tool.createdAt?.toISOString(),
      updatedAt: tool.updatedAt?.toISOString()
    }));

    // Write to file
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const jsonPath = path.join(exportDir, 'ai_marketing_tools.json');
    fs.writeFileSync(jsonPath, JSON.stringify(toolsWithCategories, null, 2), 'utf-8');

    console.log(`✓ JSON export complete: ${jsonPath}`);
    console.log(`✓ Total tools exported: ${allTools.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

main();
