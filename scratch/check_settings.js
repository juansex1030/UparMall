const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSettings() {
  const { data, error } = await supabase
    .from('Settings')
    .select('*');
  
  if (error) {
    console.error('Error fetching settings:', error);
    return;
  }
  
  console.log('Settings data:');
  console.log(JSON.stringify(data, null, 2));
}

checkSettings();
