const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectProducts() {
  const slug = 'uparshop';
  
  // 1. Get store id
  const { data: store, error: storeError } = await supabase
    .from('Stores')
    .select('*, ownerEmail')
    .eq('slug', slug)
    .single();

  if (storeError || !store) {
    console.error(`Store ${slug} not found:`, storeError?.message);
    const { data: allStores } = await supabase.from('Stores').select('*');
    console.log('Available stores:', allStores);
    return;
  }

  console.log(`Inspecting store: ${store.name || store.slug} (ID: ${store.id}) Owner: ${store.ownerEmail}`);

  // 2. Get all products for this store
  const { data: products, error: prodError } = await supabase
    .from('Product')
    .select('id, name, price, createdAt, category')
    .eq('storeId', store.id);

  if (prodError) {
    console.error('Error fetching products:', prodError.message);
    return;
  }

  console.log(`Total products found: ${products.length}`);
  
  const suspicious = products.filter(p => p.price === null || p.price === 0 || !p.name);
  
  if (suspicious.length > 0) {
    console.log('\nSuspicious products (no price or no name):');
    console.table(suspicious);
  } else {
    console.log('\nNo suspicious products found (all have price and name).');
  }

  console.log('\nAll products:');
  console.table(products);
}

inspectProducts();
