const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSettingsColumns() {
  const { data, error } = await supabase.from('Settings').select('*').limit(1);
  if (error) {
    console.error('Error fetching settings:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns in Settings table:', Object.keys(data[0]));
  } else {
    console.log('No settings found to check columns.');
  }
}

checkSettingsColumns();
