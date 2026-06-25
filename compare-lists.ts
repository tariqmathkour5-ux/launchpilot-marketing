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
  const dbNames = allTools.map(t => t.name).sort();
  const jsonNames = toolsData.map(t => t.name).sort();
  
  console.log('Tools in JSON but not in DB:');
  let missing = 0;
  jsonNames.forEach(name => {
    if (!dbNames.includes(name)) {
      console.log(`  - ${name}`);
      missing++;
    }
  });
  
  console.log(`\nTotal missing: ${missing}`);
  console.log(`\nJSON count: ${jsonNames.length}`);
  console.log(`DB count: ${dbNames.length}`);
  
  process.exit(0);
}

main();
