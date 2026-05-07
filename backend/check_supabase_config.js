const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function checkExtensions() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT name, installed_version FROM pg_available_extensions WHERE name = \'pg_net\';');
    console.log('pg_net status:', res.rows);
    
    const res2 = await client.query('SELECT * FROM pg_trigger WHERE tgname = \'on_auth_user_created\';');
    console.log('Trigger status:', res2.rows.length > 0 ? 'Installed' : 'Missing');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkExtensions();
