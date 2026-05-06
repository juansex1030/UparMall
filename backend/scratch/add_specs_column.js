const { Client } = require('pg');
require('dotenv').config();

async function addSpecificationsColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos...');

    const query = 'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "specifications" JSONB DEFAULT \'[]\'::jsonb;';
    await client.query(query);
    console.log('Columna "specifications" añadida exitosamente (o ya existía).');

  } catch (err) {
    console.error('Error al añadir la columna:', err);
  } finally {
    await client.end();
  }
}

addSpecificationsColumn();
