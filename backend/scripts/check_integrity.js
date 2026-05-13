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
        s.id as settings_id, 
        s."storeId", 
        st.id as store_id, 
        st.email,
        st.slug
      FROM "Settings" s 
      FULL OUTER JOIN "Stores" st ON s."storeId" = st.id;
    `);
    console.log('DATABASE_INTEGRITY:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await client.end();
  }
}

check();
