const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkColumns() {
  const { data, error } = await supabase.from('Product').select('*').limit(1);
  if (error) {
    console.error('Error fetching product:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns in Product table:', Object.keys(data[0]));
  } else {
    console.log('No products found to check columns.');
  }
}

checkColumns();
