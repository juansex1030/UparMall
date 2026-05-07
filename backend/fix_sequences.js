const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function fixSequence() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database to fix sequences...');

    // Fix sequence for Settings table
    await client.query("SELECT setval(pg_get_serial_sequence('\"Settings\"', 'id'), coalesce(max(id), 0) + 1, false) FROM \"Settings\";");
    
    // Also fix sequence for Product table just in case
    await client.query("SELECT setval(pg_get_serial_sequence('\"Product\"', 'id'), coalesce(max(id), 0) + 1, false) FROM \"Product\";");

    console.log('✅ Sequences fixed successfully.');

  } catch (err) {
    console.error('❌ Error fixing sequences:', err.message);
  } finally {
    await client.end();
  }
}

fixSequence();
