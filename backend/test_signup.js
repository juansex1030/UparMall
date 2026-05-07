const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testSignUp() {
  const email = `test-${Date.now()}@test.com`;
  const password = 'password123';
  
  console.log(`Testing signUp with ${email}...`);
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    const duration = Date.now() - startTime;
    console.log(`Duration: ${duration}ms`);
    
    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ Success:', data.user ? 'User created' : 'Check email');
    }
  } catch (err) {
    console.error('❌ Fatal error:', err);
  }
}

testSignUp();
