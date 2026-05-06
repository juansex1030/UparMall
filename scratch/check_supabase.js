const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking schema for project:', supabaseUrl);
  
  const { data: stores, error: storesError } = await supabase.from('Stores').select('*').limit(1);
  if (storesError) {
    console.error('Error reading Stores table:', storesError);
  } else {
    console.log('Stores table exists.');
  }

  const { data: settings, error: settingsError } = await supabase.from('Settings').select('*').limit(1);
  if (settingsError) {
    console.error('Error reading Settings table:', settingsError);
  } else {
    console.log('Settings table exists. Columns:', Object.keys(settings[0] || {}));
  }

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error('Error listing buckets:', bucketsError);
  } else {
    console.log('Buckets:', buckets.map(b => b.name));
  }
}

checkSchema();
