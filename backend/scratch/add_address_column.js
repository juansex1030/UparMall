
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAddressColumn() {
  console.log('Adding address column to Settings table...');
  
  // En Supabase, para añadir columnas mediante JS sin usar SQL directo (si no hay rpc) 
  // normalmente se usa el dashboard o migraciones.
  // Pero intentaré usar una query SQL mediante un truco o simplemente reportar que se necesita.
  
  // Realmente la mejor forma es usar el SQL Editor.
  // Pero intentaré hacer un "upsert" con una columna nueva a ver si falla o la crea (SPOILER: fallará si no existe).
  
  // Usaré rpc si está disponible, sino, le pediré al usuario o lo haré yo si tengo acceso a la DB.
  
  const { error } = await supabase.rpc('exec_sql', { 
    query: 'ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "address" TEXT;' 
  });

  if (error) {
    console.error('Error adding column via RPC:', error.message);
    console.log('Please run this SQL in your Supabase Editor:');
    console.log('ALTER TABLE "Settings" ADD COLUMN "address" TEXT;');
  } else {
    console.log('Address column added successfully!');
  }
}

addAddressColumn();
