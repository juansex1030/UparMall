const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function runMigrations() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const queries = [
      "ALTER TABLE \"Settings\" ADD COLUMN IF NOT EXISTS \"heroSlides\" jsonb DEFAULT '[]'::jsonb;",
      "ALTER TABLE \"Settings\" ADD COLUMN IF NOT EXISTS \"fontFamily\" text DEFAULT 'Inter, sans-serif';",
      "ALTER TABLE \"Settings\" ADD COLUMN IF NOT EXISTS \"navbarStyle\" text DEFAULT 'glass';",
      "ALTER TABLE \"Settings\" ADD COLUMN IF NOT EXISTS \"cardStyle\" text DEFAULT 'elevated';",
      "ALTER TABLE \"Settings\" ADD COLUMN IF NOT EXISTS \"socialLinks\" jsonb DEFAULT '{\"instagram\": \"\", \"facebook\": \"\", \"tiktok\": \"\"}'::jsonb;",
      "ALTER TABLE \"Settings\" ADD COLUMN IF NOT EXISTS \"accentColor\" text DEFAULT '#6366f1';",
      "ALTER TABLE \"Settings\" ADD COLUMN IF NOT EXISTS \"deliveryFee\" numeric DEFAULT 0;",
      "ALTER TABLE \"Settings\" ADD COLUMN IF NOT EXISTS \"businessHours\" jsonb DEFAULT '[]'::jsonb;"
    ];

    for (let query of queries) {
      try {
        await client.query(query);
        console.log('Executed:', query);
      } catch (err) {
        console.error('Error executing query:', query, err.message);
      }
    }

  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

runMigrations();
