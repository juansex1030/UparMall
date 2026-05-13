const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    // Query constraints for Settings table
    const res = await client.query(`
      SELECT 
        conname as constraint_name, 
        pg_get_constraintdef(c.oid) as definition
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'Settings';
    `);
    console.log('CONSTRAINTS:', JSON.stringify(res.rows, null, 2));
    
    // Also check for NOT NULL columns
    const res2 = await client.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Settings';
    `);
    console.log('COLUMNS_NULLABILITY:', JSON.stringify(res2.rows, null, 2));

  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await client.end();
  }
}

check();
