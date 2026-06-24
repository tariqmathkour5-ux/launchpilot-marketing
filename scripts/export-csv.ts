import { getDb } from '../server/db';
import { tools, categories } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
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

    // Prepare CSV headers
    const headers = [
      'ID',
      'Name',
      'Website',
      'Category',
      'Description',
      'Pricing Model',
      'Is Verified',
      'Rating',
      'Features',
      'Integrations',
      'API Available',
      'Created At',
      'Updated At'
    ];

    // Prepare CSV rows
    const rows = allTools.map(tool => [
      tool.id,
      `"${tool.name.replace(/"/g, '""')}"`,
      tool.website,
      categoryMap.get(tool.categoryId) || 'Unknown',
      `"${tool.description.replace(/"/g, '""')}"`,
      tool.pricingModel,
      tool.isVerified ? 'Yes' : 'No',
      tool.rating || '0',
      `"${Array.isArray(tool.features) ? tool.features.join(', ') : ''}"`,
      `"${Array.isArray(tool.integrations) ? tool.integrations.join(', ') : ''}"`,
      tool.apiAvailable ? 'Yes' : 'No',
      tool.createdAt?.toISOString() || '',
      tool.updatedAt?.toISOString() || ''
    ]);

    // Generate CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Write to file
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const csvPath = path.join(exportDir, 'ai_marketing_tools.csv');
    fs.writeFileSync(csvPath, csvContent, 'utf-8');

    console.log(`✓ CSV export complete: ${csvPath}`);
    console.log(`✓ Total tools exported: ${allTools.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

main();
