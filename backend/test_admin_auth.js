const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testAdmin() {
  console.log('Testing adminClient auth.admin...');
  
  try {
    // List some users to see if it works
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error listing users:', error.message);
    } else {
      console.log('✅ Successfully listed users. Count:', users.length);
      if (users.length > 0) {
        const firstUser = users[0];
        console.log(`Testing getUserById for ${firstUser.id}...`);
        const { data: { user }, error: getError } = await supabase.auth.admin.getUserById(firstUser.id);
        if (getError) {
          console.error('❌ Error getting user:', getError.message);
        } else {
          console.log('✅ Success! User email:', user.email);
        }
      }
    }
  } catch (err) {
    console.error('❌ Fatal error:', err);
  }
}

testAdmin();
