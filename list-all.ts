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
  
  // Find which tool appears in JSON but somehow not matching in DB
  console.log('Checking each JSON tool:');
  let found = 0;
  jsonNames.forEach((name, i) => {
    const inDb = dbNames.has(name);
    if (inDb) found++;
    if (!inDb) {
      console.log(`${i + 1}. ${name} - NOT IN DB`);
    }
  });
  
  console.log(`\nFound in DB: ${found}/${jsonNames.length}`);
  
  process.exit(0);
}

main();
