import { getDb } from './server/db';
import { tools } from './drizzle/schema';

async function main() {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    process.exit(1);
  }

  const allTools = await db.select().from(tools);
  console.log(`Total tools in database: ${allTools.length}`);
  
  // List last 5
  console.log('\nLast 5 tools:');
  allTools.slice(-5).forEach((tool, i) => {
    console.log(`${allTools.length - 4 + i}. ${tool.name}`);
  });
  
  process.exit(0);
}

main();
