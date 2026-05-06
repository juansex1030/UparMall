const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucket() {
  const { data: bucket, error } = await supabase.storage.getBucket('pos-images');
  if (error) {
    console.error('Error getting bucket:', error);
  } else {
    console.log('Bucket "pos-images" public status:', bucket.public);
  }
}

checkBucket();
