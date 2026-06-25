import { getDb } from './server/db';
import { tools } from './drizzle/schema';
import toolsData from './data/ai_marketing_tools_phase2.json';

async function main() {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    process.exit(1);
  }

  const allTools = await db.select().from(tools);
  const dbNames = new Set(allTools.map(t => t.name));
  
  const jsonNames = toolsData.map(t => t.name);
  const missing = jsonNames.filter(name => !dbNames.has(name));
  
  console.log(`JSON: ${jsonNames.length}, DB: ${allTools.length}`);
  console.log(`Missing: ${missing.length}`);
  
  if (missing.length > 0) {
    missing.forEach(name => {
      console.log(`  - ${name}`);
    });
  }
  
  process.exit(0);
}

main();
