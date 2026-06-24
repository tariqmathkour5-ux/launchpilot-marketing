import { getDb } from '../server/db';
import { categories, tools } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/ai_marketing_tools_phase2.json'), 'utf-8'));

async function importTools() {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    process.exit(1);
  }

  try {
    // Group tools by category
    const categoryMap: Record<string, any[]> = {};
    toolsData.forEach((tool: any) => {
      if (!categoryMap[tool.category]) {
        categoryMap[tool.category] = [];
      }
      categoryMap[tool.category].push(tool);
    });

    // Insert categories first
    const categoryIds: Record<string, number> = {};
    let categoryOrder = 1;
    for (const [categoryName, toolsList] of Object.entries(categoryMap)) {
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
      
      // Insert category
      await db.insert(categories).values({
        name: categoryName,
        slug: slug,
        icon: '🤖',
        color: '#3B82F6',
        displayOrder: categoryOrder++,
      }).onDuplicateKeyUpdate({
        set: { name: categoryName }
      });
      
      // Get the category ID
      const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
      if (cat) {
        categoryIds[categoryName] = cat.id;
      }
    }

    // Insert tools
    let insertedCount = 0;
    for (const tool of toolsData) {
      const categoryId = categoryIds[tool.category];
      if (!categoryId) {
        console.warn(`Category not found for tool: ${tool.name}`);
        continue;
      }

      const slug = tool.name.toLowerCase().replace(/\s+/g, '-');
      await db.insert(tools).values({
        name: tool.name,
        slug: slug,
        website: tool.website,
        categoryId: categoryId,
        description: tool.description,
        pricingModel: tool.freePlan ? 'freemium' : (tool.freeTrial ? 'trial' : 'paid'),
        pricingTier: tool.pricing,
        tags: JSON.stringify(tool.features || []),
        features: JSON.stringify(tool.features || []),
        integrations: JSON.stringify(tool.integrations || []),
        apiAvailable: tool.apiAvailable ? 1 : 0,
        targetAudience: tool.targetAudience || '',
        rating: 4.5,
        verified: 1,
      }).onDuplicateKeyUpdate({
        set: { name: tool.name }
      });

      insertedCount++;
      if (insertedCount % 10 === 0) {
        console.log(`Imported ${insertedCount} tools...`);
      }
    }

    console.log(`✅ Successfully imported ${insertedCount} tools into the database`);
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importTools();
