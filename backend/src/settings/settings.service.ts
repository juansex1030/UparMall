import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { slugify } from '../utils/slugify';

@Injectable()
export class SettingsService {
  constructor(private supabase: SupabaseService) {}

  async findBySlug(slug: string) {
    // Primero, buscar el storeId basado en el slug
    const { data: store, error: storeError } = await this.supabase.adminClient
      .from('Stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (storeError || !store) throw new NotFoundException(`Configuración para la tienda '${slug}' no encontrada`);

    const { data, error } = await this.supabase.adminClient
      .from('Settings')
      .select('*')
      .eq('storeId', store.id)
      .single();

    if (error) throw error;
    return data;
  }

  async findByStoreId(storeId: string) {
    let { data: settings, error } = await this.supabase.adminClient
      .from('Settings')
      .select('*, Stores ( slug )')
      .eq('storeId', storeId)
      .single();

    if (error && error.code === 'PGRST116') {
      console.log('New user detected, creating default settings for:', storeId);
      
      const { data: userResponse, error: userError } = await this.supabase.adminClient.auth.admin?.getUserById(storeId) || { data: null, error: new Error('Admin auth not available') };
      
      if (userError) {
        console.error('Error fetching user from auth:', userError.message);
      }

      const email = userResponse?.user?.email || `tienda-${Math.floor(Math.random()*1000)}`;
      let baseSlug = slugify(email.split('@')[0]).toLowerCase();
      let defaultSlug = baseSlug;
      
      // Verificar si el slug ya existe (insensible a mayúsculas)
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        const { data: existingStore } = await this.supabase.adminClient
          .from('Stores')
          .select('slug')
          .ilike('slug', defaultSlug)
          .single();
        
        if (!existingStore) {
          isUnique = true;
        } else {
          // Si existe, le pegamos un número aleatorio y reintentamos
          defaultSlug = `${baseSlug}-${Math.floor(Math.random() * 999)}`;
          attempts++;
        }
      }

      console.log('Creating store with unique slug:', defaultSlug);
      const { error: storeError } = await this.supabase.adminClient.from('Stores').upsert([{
        id: storeId,
        slug: defaultSlug,
        ownerName: email
      }], { onConflict: 'id' });

      if (storeError) {
        console.error('Error creating store:', storeError.message);
        throw storeError;
      }

      console.log('Creating default settings...');
      // Crear Settings
      const { data: newSettings, error: insertError } = await this.supabase.adminClient.from('Settings').upsert([{
        storeId: storeId,
        businessName: 'Mi Nueva Tienda',
        primaryColor: '#3a536e',
        secondaryColor: '#3f51b5',
        whatsappNumber: '573000000000',
        welcomeMessage: '¡Hola! Quiero hacer un pedido.',
        fontFamily: "'Inter', sans-serif",
        navbarStyle: 'glass',
        socialLinks: { instagram: '', facebook: '', tiktok: '' },
        heroSlides: []
      }], { onConflict: 'storeId' }).select('*, Stores ( slug )').single();

      if (insertError) {
        console.error('Error creating settings:', insertError.message);
        throw insertError;
      }
      
      console.log('Default settings created successfully');
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
    
    // Si se envía el slug, sanitizarlo y actualizarlo en la tabla Stores
    if (slug) {
      const cleanSlug = slugify(slug);
      const { error: storeError } = await this.supabase.adminClient
        .from('Stores')
        .update({ slug: cleanSlug })
        .eq('id', storeId);
      
      if (storeError) {
        // Podría fallar si el slug ya existe (violación de restricción única)
        throw new Error('El nombre de la URL ya está en uso por otra tienda. Elige uno diferente.');
      }
    }

    const payload = {
      ...cleanData
    };

    const { data, error } = await this.supabase.adminClient
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
