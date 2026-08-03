-- Módulo de Restaurantes: Esquema Base

-- 1. Actualizar la tabla Stores para incluir el tipo de tienda
ALTER TABLE "public"."Stores" 
ADD COLUMN IF NOT EXISTS "store_type" text DEFAULT 'RETAIL' 
CHECK ("store_type" IN ('RETAIL', 'RESTAURANT'));

-- 2. Crear tabla Tables (Mesas)
CREATE TABLE IF NOT EXISTS "public"."Tables" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "store_id" uuid NOT NULL REFERENCES "public"."Stores"("id") ON DELETE CASCADE,
    "name" text NOT NULL, -- Ej: "Mesa 1", "Barra", "Terraza 3"
    "status" text DEFAULT 'free' CHECK ("status" IN ('free', 'occupied', 'pending_payment')),
    "current_order_id" uuid, -- ID del pedido abierto actualmente en la mesa (opcional, para referencias rápidas)
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

-- 3. Crear tabla Staff (Meseros, Cocineros)
CREATE TABLE IF NOT EXISTS "public"."Staff" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "store_id" uuid NOT NULL REFERENCES "public"."Stores"("id") ON DELETE CASCADE,
    "name" text NOT NULL,
    "role" text NOT NULL CHECK ("role" IN ('WAITER', 'KITCHEN', 'ADMIN')),
    "pin_code" text NOT NULL, -- PIN de 4 dígitos para login rápido en el POS
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

-- 4. Actualizar la tabla Orders (Pedidos/Comandas)
ALTER TABLE "public"."Orders"
ADD COLUMN IF NOT EXISTS "table_id" uuid REFERENCES "public"."Tables"("id") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "waiter_id" uuid REFERENCES "public"."Staff"("id") ON DELETE SET NULL;

-- 5. Crear tabla OrderItems (Para relacionar 1 pedido con muchos productos de forma detallada, permitiendo modificaciones)
CREATE TABLE IF NOT EXISTS "public"."OrderItems" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "order_id" uuid NOT NULL REFERENCES "public"."Orders"("id") ON DELETE CASCADE,
    "product_id" int8 NOT NULL REFERENCES "public"."Product"("id") ON DELETE CASCADE,
    "product_name" text NOT NULL,
    "quantity" int4 NOT NULL DEFAULT 1,
    "price" numeric NOT NULL,
    "notes" text, -- Ej: "Sin cebolla"
    "status" text DEFAULT 'pending' CHECK ("status" IN ('pending', 'cooking', 'served', 'cancelled')),
    "created_at" timestamp with time zone DEFAULT now()
);

-- NOTA IMPORTANTE:
-- Asegúrate de que las políticas de seguridad (RLS) en Supabase estén configuradas
-- para permitir la lectura y escritura a los usuarios autenticados para las nuevas tablas.
