import { getDb } from './server/db';
import { tools } from './drizzle/schema';

async function main() {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    process.exit(1);
  }

  const allTools = await db.select().from(tools);
  const names = allTools.map(t => t.name);
  
  // Find duplicates
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  const uniqueDuplicates = new Set(duplicates);
  
  console.log(`Total: ${names.length}, Unique: ${new Set(names).size}`);
  
  if (uniqueDuplicates.size > 0) {
    console.log('\nDuplicates in DB:');
    uniqueDuplicates.forEach(name => {
      const count = names.filter(n => n === name).length;
      console.log(`  - ${name}: ${count} times`);
    });
  }
  
  process.exit(0);
}

main();
