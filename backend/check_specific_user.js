const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use service role key to check all users
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUser() {
  const email = 'juansebastian1030@hotmail.com';
  console.log(`Checking user ${email}...`);
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  const user = users.find(u => u.email === email);
  if (user) {
    console.log('✅ User exists:', user.id);
    console.log('Confirmed at:', user.email_confirmed_at);
    console.log('Last sign in:', user.last_sign_in_at);
  } else {
    console.log('❌ User does NOT exist in Supabase.');
  }
}

checkUser();
