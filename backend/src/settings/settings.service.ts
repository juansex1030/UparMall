import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private supabase: SupabaseService) {}

  async onModuleInit() {
    // Initialization is now handled at store creation time, not globally.
  }

  async findBySlug(slug: string) {
    // Primero, buscar el storeId basado en el slug
    const { data: store, error: storeError } = await this.supabase.client
      .from('Stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (storeError || !store) throw new NotFoundException(`Configuración para la tienda '${slug}' no encontrada`);

    const { data, error } = await this.supabase.client
      .from('Settings')
      .select('*')
      .eq('storeId', store.id)
      .single();

    if (error) throw error;
    return data;
  }

  async findByStoreId(storeId: string) {
    let { data: settings, error } = await this.supabase.client
      .from('Settings')
      .select('*, Stores ( slug )')
      .eq('storeId', storeId)
      .single();

    if (error && error.code === 'PGRST116') {
      const { data: userResponse } = await this.supabase.client.auth.admin?.getUserById(storeId) || { data: null };
      const email = userResponse?.user?.email || `tienda-${Math.floor(Math.random()*1000)}`;
      const defaultSlug = email.split('@')[0] + '-' + Math.floor(Math.random() * 100);

      const { error: storeError } = await this.supabase.client.from('Stores').upsert([{
        id: storeId,
        slug: defaultSlug,
        ownerName: email
      }], { onConflict: 'id' });

      if (storeError) throw storeError;

      // Crear Settings
      const { data: newSettings, error: insertError } = await this.supabase.client.from('Settings').upsert([{
        storeId: storeId,
        businessName: 'Mi Nueva Tienda',
        primaryColor: '#3a536e',
        secondaryColor: '#3f51b5',
        whatsappNumber: '573000000000',
        welcomeMessage: '¡Hola! Quiero hacer un pedido.'
      }], { onConflict: 'storeId' }).select('*, Stores ( slug )').single();

      if (insertError) throw insertError;
      settings = newSettings;
    } else if (error) {
      throw error;
    }
    
    // Flatten the result a bit for convenience
    return {
      ...settings,
      slug: settings.Stores?.slug
    };
  }

  async update(updateSettingDto: UpdateSettingDto & { slug?: string }, storeId: string) {
    const { id: _, createdAt: __, slug, ...cleanData } = updateSettingDto as any;
    
    // Si se envía el slug, actualizarlo en la tabla Stores
    if (slug) {
      const { error: storeError } = await this.supabase.client
        .from('Stores')
        .update({ slug })
        .eq('id', storeId);
      
      if (storeError) {
        // Podría fallar si el slug ya existe (violación de restricción única)
        throw new Error('No se pudo actualizar el nombre de la URL. Es posible que ya esté en uso.');
      }
    }

    const payload = {
      ...cleanData
    };

    const { data, error } = await this.supabase.client
      .from('Settings')
      .update(payload)
      .eq('storeId', storeId)
      .select('*, Stores ( slug )')
      .single();

    if (error) throw error;
    
    return {
      ...data,
      slug: data.Stores?.slug
    };
  }
}
