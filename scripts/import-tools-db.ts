import { getDb } from '../server/db';
import { tools, categories } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import toolsData from '../data/ai_marketing_tools_phase2.json';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    process.exit(1);
  }

  try {
    // First, ensure categories exist
    const categoryNames = ['AI SEO Tools', 'AI Email Marketing Tools', 'AI Lead Generation Tools', 'AI Copywriting Tools', 'AI Automation Tools'];
    const categoryMap: Record<string, number> = {};
    
    for (const categoryName of categoryNames) {
      const slug = slugify(categoryName);
      
      // Check if category exists
      const existing = await db.select().from(categories).where(eq(categories.name, categoryName)).limit(1);
      
      if (existing.length > 0) {
        categoryMap[categoryName] = existing[0].id;
      } else {
        // Insert new category
        const result = await db.insert(categories).values({
          name: categoryName,
          slug: slug,
          icon: '🤖',
          color: '#3b82f6',
          displayOrder: categoryNames.indexOf(categoryName) + 1,
        });
        
        // Get the inserted ID
        const inserted = await db.select().from(categories).where(eq(categories.name, categoryName)).limit(1);
        if (inserted.length > 0) {
          categoryMap[categoryName] = inserted[0].id;
        }
      }
    }

    console.log('✓ Categories created/verified');
    console.log('Category Map:', categoryMap);

    // Insert tools
    let inserted = 0;
    for (const tool of toolsData) {
      const categoryId = categoryMap[tool.category];
      if (!categoryId) {
        console.warn(`⚠ Skipping tool ${tool.name}: category not found`);
        continue;
      }

      // Determine pricing model
      let pricingModel: 'free' | 'freemium' | 'paid' | 'enterprise' | 'open_source' = 'freemium';
      if (tool.pricing.toLowerCase().includes('custom')) {
        pricingModel = 'enterprise';
      } else if (tool.freePlan === false && !tool.pricing.includes('Free')) {
        pricingModel = 'paid';
      } else if (tool.pricing.toLowerCase().includes('open')) {
        pricingModel = 'open_source';
      } else if (tool.freePlan === true && !tool.pricing.includes('Free')) {
        pricingModel = 'freemium';
      } else if (tool.freePlan === true && tool.pricing.includes('Free')) {
        pricingModel = 'free';
      }

      await db.insert(tools).values({
        name: tool.name,
        slug: slugify(tool.name),
        description: tool.description,
        website: tool.website,
        categoryId: categoryId,
        pricingModel: pricingModel,
        tags: [tool.category.split(' ')[0], tool.category.split(' ')[1]],
        features: tool.features,
        integrations: tool.integrations,
        apiAvailable: tool.apiAvailable,
        isVerified: true,
        rating: 4.5,
      }).onDuplicateKeyUpdate({
        set: { name: tool.name }
      });
      
      inserted++;
      if (inserted % 10 === 0) {
        console.log(`✓ Inserted ${inserted} tools...`);
      }
    }

    console.log(`\n✓ Successfully imported ${inserted} AI marketing tools`);
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

main();
