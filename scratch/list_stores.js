const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listStores() {
  const { data, error } = await supabase.from('Stores').select('*');
  if (error) {
    console.error('Error fetching stores:', error);
    return;
  }
  console.log('Stores:', JSON.stringify(data, null, 2));
}

listStores();
