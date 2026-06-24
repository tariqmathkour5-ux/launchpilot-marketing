import mysql from 'mysql2/promise';
import * as fs from 'fs';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const sql = fs.readFileSync('./drizzle/0000_init.sql', 'utf-8');
const statements = sql.split(';').filter(s => s.trim());

for (const statement of statements) {
  if (statement.trim()) {
    try {
      await connection.execute(statement + ';');
      console.log('✓ Executed:', statement.substring(0, 50) + '...');
    } catch (err) {
      console.error('✗ Error:', err.message);
    }
  }
}

await connection.end();
console.log('Migration complete!');
