const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function auditDatabase() {
  console.log('--- INICIANDO AUDITORÍA DE BASE DE DATOS ---');
  
  try {
    // 1. Verificar Tablas de Pedidos
    const tablesToTest = ['Order', 'Orders', 'OrderItem', 'OrderItems', 'Product', 'Stores', 'Settings'];
    console.log('\n1. Verificando existencia de tablas:');
    
    for (const table of tablesToTest) {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        console.log(`[X] Tabla '${table}': ERROR (${error.message})`);
      } else {
        console.log(`[OK] Tabla '${table}': Existe`);
      }
    }

    // 2. Verificar Columnas de Pedidos (usando un registro de muestra si existe)
    console.log('\n2. Verificando estructura de Pedidos (muestra):');
    const { data: orderSample } = await supabase.from('Orders').select('*').limit(1).single();
    if (orderSample) {
      console.log('Columnas encontradas en Orders:', Object.keys(orderSample));
      const required = ['storeId', 'customerName', 'customerPhone', 'total', 'paymentMethod'];
      required.forEach(col => {
        if (!orderSample[col] && !orderSample[col.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)]) {
          console.warn(`[!] ADVERTENCIA: La columna '${col}' parece faltar o tener un nombre distinto.`);
        }
      });
    } else {
      console.log('No hay registros en Orders para analizar columnas.');
    }

    // 3. Verificación de Seguridad (Aislamiento)
    console.log('\n3. Verificando aislamiento de datos:');
    const { data: stores } = await supabase.from('Stores').select('id, slug').limit(2);
    if (stores && stores.length > 1) {
      console.log(`Se detectaron múltiples tiendas (${stores.length}). El código debe filtrar por storeId.`);
    }

    console.log('\n--- AUDITORÍA COMPLETADA ---');
  } catch (err) {
    console.error('Error durante la auditoría:', err.message);
  }
}

auditDatabase();
