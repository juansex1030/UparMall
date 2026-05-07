const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function checkTables() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';");
    console.log('Tables in public schema:', res.rows.map(r => r.tablename));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkTables();
