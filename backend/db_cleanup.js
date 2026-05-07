const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanup() {
  const testIds = [
    'bb1b4a1d-0b62-48fd-89e6-0f71516c82e3', // test-177816...
    'c88d9fb7-0cc4-46f8-8588-d007defd316e'  // testuser@uparmall.com
  ];

  console.log('Starting cleanup of test users...');

  for (const id of testIds) {
    try {
      // 1. Delete products (manual delete because of possible missing cascade in some tables)
      await supabase.from('Product').delete().eq('storeId', id);
      
      // 2. Delete settings and stores (Settings has CASCADE on storeId usually, but let's be safe)
      await supabase.from('Settings').delete().eq('storeId', id);
      await supabase.from('Stores').delete().eq('id', id);
      
      // 3. Delete from Auth
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) console.error(`Error deleting user ${id}:`, error.message);
      else console.log(`✅ Deleted test user: ${id}`);
    } catch (err) {
      console.error(`Error processing ${id}:`, err.message);
    }
  }

  // Verify juanse vs juansebastian slugs
  console.log('\nChecking slugs for main users...');
  const { data: stores } = await supabase.from('Stores').select('id, slug, ownerName');
  console.log('Current active stores:', stores);

}

cleanup();
