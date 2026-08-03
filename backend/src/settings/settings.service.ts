/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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

    if (storeError || !store)
      throw new NotFoundException(
        `Configuración para la tienda '${slug}' no encontrada`,
      );

    const { data, error } = await this.supabase.adminClient
      .from('Settings')
      .select('*')
      .eq('storeId', store.id)
      .single();

    if (error) throw error;
    return data;
  }

  async findByStoreId(storeId: string) {
    let { data: settings } = await this.supabase.adminClient
      .from('Settings')
      .select('*, Stores ( slug, store_type )')
      .eq('storeId', storeId)
      .single();
    const { error } = await this.supabase.adminClient
      .from('Settings')
      .select('*, Stores ( slug, store_type )')
      .eq('storeId', storeId)
      .single();

    if (error && error.code === 'PGRST116') {
      const { data: userResponse, error: userError } =
        (await this.supabase.adminClient.auth.admin?.getUserById(storeId)) || {
          data: null,
          error: new Error('Admin auth not available'),
        };

      if (userError) {
        console.error('Error fetching user from auth:', userError.message);
      }

      const email =
        userResponse?.user?.email ||
        `tienda-${Math.floor(Math.random() * 1000)}`;
      const baseSlug = slugify(email.split('@')[0]).toLowerCase();
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

      const { error: storeError } = await this.supabase.adminClient
        .from('Stores')
        .upsert(
          [
            {
              id: storeId,
              slug: defaultSlug,
              ownerName: email,
            },
          ],
          { onConflict: 'id' },
        );

      if (storeError) {
        console.error('Error creating store:', storeError.message);
        throw storeError;
      }

      // Crear Settings
      const { data: newSettings, error: insertError } =
        await this.supabase.adminClient
          .from('Settings')
          .upsert(
            [
              {
                storeId: storeId,
                businessName: 'Mi Nueva Tienda',
                primaryColor: '#3a536e',
                secondaryColor: '#3f51b5',
                whatsappNumber: '573000000000',
                welcomeMessage: '¡Hola! Quiero hacer un pedido.',
                fontFamily: "'Inter', sans-serif",
                navbarStyle: 'glass',
                socialLinks: { instagram: '', facebook: '', tiktok: '' },
                heroSlides: [],
                hasDelivery: true,
                allowCashOnDelivery: true,
                enableCombos: false,
              },
            ],
            { onConflict: 'storeId' },
          )
          .select('*, Stores ( slug, store_type )')
          .single();

      if (insertError) {
        console.error('Error creating settings:', insertError.message);
        throw insertError;
      }

      settings = newSettings;
    } else if (error) {
      throw error;
    }

    return {
      ...settings,
      mode: settings.mode || 'standard',
      slug: settings.Stores?.slug,
      store_type: settings.Stores?.store_type,
    };
  }

  async update(
    updateSettingDto: UpdateSettingDto & { slug?: string },
    storeId: string,
  ) {
    const { slug, ...rawPayload } = updateSettingDto as Record<string, unknown>;

    delete rawPayload['id'];
    delete rawPayload['createdAt'];
    delete rawPayload['storeId'];

    // 1. ACTUALIZACIÓN DE SLUG (TABLA STORES) - Si viene el slug
    if (slug) {
      const cleanSlug = slugify(slug as string);
      const { error: storeError } = await this.supabase.adminClient
        .from('Stores')
        .update({ slug: cleanSlug })
        .eq('id', storeId);

      if (storeError) {
        console.error('Error actualizando Stores:', storeError);
        if (storeError.code === '23505') {
          throw new HttpException(
            'La URL ya existe. Elige otra.',
            HttpStatus.CONFLICT,
          );
        }
      }
    }

    // 2. FILTRADO DE DATOS PARA TABLA SETTINGS
    const validColumns = [
      'businessName',
      'logoUrl',
      'primaryColor',
      'secondaryColor',
      'accentColor',
      'backgroundColor',
      'backgroundImageUrl',
      'whatsappNumber',
      'welcomeMessage',
      'description',
      'fontFamily',
      'navbarStyle',
      'cardStyle',
      'socialLinks',
      'heroSlides',
      'businessHours',
      'deliveryFee',
      'hasDelivery',
      'allowCashOnDelivery',
      'address',
      'nit',
      'guaranteeTerms',
      'enableCombos',
      'allowDigitalTransfers',
      'digitalTransferDetails',
      'digitalAccounts',
    ];

    const finalPayload: Record<string, unknown> = {};
    for (const key of validColumns) {
      if (rawPayload[key] !== undefined) {
        // Normalización de tipos
        if (key === 'deliveryFee') {
          finalPayload[key] = rawPayload[key] ? Number(rawPayload[key]) : 0;
        } else if (
          key === 'hasDelivery' ||
          key === 'allowCashOnDelivery' ||
          key === 'enableCombos' ||
          key === 'allowDigitalTransfers'
        ) {
          finalPayload[key] = Boolean(rawPayload[key]);
        } else {
          finalPayload[key] = rawPayload[key];
        }
      }
    }

    // 3. ACTUALIZACIÓN DE TABLA SETTINGS

    const { data, error: updateError } = await this.supabase.adminClient
      .from('Settings')
      .update(finalPayload)
      .eq('storeId', storeId)
      .select()
      .single();

    if (updateError) {
      console.error('ERROR CRÍTICO DB SETTINGS:', updateError);
      throw new HttpException(
        `Error DB: ${updateError.message} (Código: ${updateError.code})`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      ...data,
      mode: data.mode || 'standard',
      slug: slug || data.slug, // Devolvemos el slug actualizado o el anterior
    };
  }
}
