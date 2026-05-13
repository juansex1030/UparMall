const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to find .env in current or parent
let envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  envPath = path.join(process.cwd(), 'backend', '.env');
}
if (!fs.existsSync(envPath)) {
  envPath = path.join(process.cwd(), '..', '.env');
}

require('dotenv').config({ path: envPath });

if (!process.env.SUPABASE_URL) {
  console.error('SUPABASE_URL not found in', envPath);
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addSettingsColumns() {
  console.log('Checking and adding columns to Settings table...');
  
  const { error } = await supabase.from('Settings').update({ 
    hasDelivery: true,
    allowCashOnDelivery: true 
  }).match({ id: 1 }); 
  
  if (error && error.message.includes('column') && error.message.includes('does not exist')) {
    console.log('Columns do not exist. You need to add them via Supabase SQL Editor:');
    console.log('ALTER TABLE "Settings" ADD COLUMN "hasDelivery" BOOLEAN DEFAULT TRUE;');
    console.log('ALTER TABLE "Settings" ADD COLUMN "allowCashOnDelivery" BOOLEAN DEFAULT TRUE;');
    
    // Attempting to add them via RPC if available (unlikely without setup)
    // But I'll just report it to the user if it fails.
  } else if (error) {
    console.error('Error (might be unrelated to columns):', error.message);
  } else {
    console.log('Columns exist or were successfully updated!');
  }
}

addSettingsColumns();
