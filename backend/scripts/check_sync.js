const { Client } = require('pg');
require('dotenv').config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    const res = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM "Stores") as stores_count, 
        (SELECT COUNT(*) FROM "Settings") as settings_count
    `);
    console.log('COUNTS:', JSON.stringify(res.rows[0], null, 2));
    
    const res2 = await client.query(`
      SELECT st.id as store_id, st.slug, s.id as settings_id
      FROM "Stores" st
      LEFT JOIN "Settings" s ON st.id = s."storeId"
      WHERE s.id IS NULL;
    `);
    console.log('STORES_WITHOUT_SETTINGS:', JSON.stringify(res2.rows, null, 2));

  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await client.end();
  }
}

check();
