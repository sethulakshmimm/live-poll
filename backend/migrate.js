// Simple migration runner for PostgreSQL
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const POSTGRES_URL = process.env.POSTGRES_URL || 'postgresql://polluser:pollpass@localhost:5432/polls';

async function runMigrations() {
  const client = new Client({ connectionString: POSTGRES_URL });
  await client.connect();
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await client.query(sql);
  }
  await client.end();
  console.log('Migrations complete.');
}

if (require.main === module) {
  runMigrations().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
