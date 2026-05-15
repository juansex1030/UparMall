import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class SupabaseService {
  public client: SupabaseClient;
  public adminClient: SupabaseClient;

  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.error('ERROR: SUPABASE_URL o SUPABASE_KEY no están definidos en .env');
    }
    
    // Cliente estándar (anon)
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );

    // Cliente administrativo (service_role)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.adminClient = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    } else {
      console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY no está definido. Algunas funciones administrativas podrían fallar.');
      this.adminClient = this.client;
    }
  }

  /**
   * Crea un cliente autenticado con el JWT del usuario.
   * Esto permite que las políticas RLS se apliquen correctamente.
   */
  getClient(token?: string): SupabaseClient {
    if (!token) return this.client;
    
    return createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
  }
}
