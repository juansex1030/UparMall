const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function checkColumnDefinition() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, column_default, is_identity, identity_generation
      FROM information_schema.columns
      WHERE table_name = 'Settings' AND column_name = 'id';
    `);
    console.log('Column definition:', res.rows[0]);
    
    const res2 = await client.query("SELECT * FROM \"Settings\" LIMIT 5;");
    console.log('Current rows in Settings:', res2.rows.map(r => ({ id: r.id, storeId: r.storeId })));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkColumnDefinition();
