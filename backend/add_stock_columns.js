const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

const connectionString = process.env.DATABASE_URL;

async function addStockColumns() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database to add stock columns...');

    // Add columns if they don't exist
    await client.query(`
      ALTER TABLE "Product" 
      ADD COLUMN IF NOT EXISTS "manageStock" BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "stock" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "lowStockThreshold" INTEGER DEFAULT 5;
    `);

    console.log('✅ Stock columns added successfully to "Product" table.');

  } catch (err) {
    console.error('❌ Error adding columns:', err.message);
  } finally {
    await client.end();
  }
}

addStockColumns();
