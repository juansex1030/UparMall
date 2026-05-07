const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function checkSchema() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Settings';
    `);
    console.log('Settings columns:', res.rows);
    
    const res2 = await client.query(`
      SELECT conname, pg_get_constraintdef(oid)
      FROM pg_constraint
      WHERE conrelid = 'public."Settings"'::regclass;
    `);
    console.log('Constraints:', res2.rows);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkSchema();
