import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProductsService {
  constructor(private supabase: SupabaseService) {}

  async create(createProductDto: CreateProductDto, storeId: string) {
    
    // Asegurar que isActive y las fechas tengan valores válidos
    const now = new Date().toISOString();
    const payload = {
      ...createProductDto,
      storeId,
      isActive: createProductDto.isActive ?? true,
      category: createProductDto.category ?? 'General',
      specifications: createProductDto.specifications ?? [],
      createdAt: now,
      updatedAt: now
    };

    const { data, error } = await this.supabase.client
      .from('Product')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(storeId?: string) {
    let query = this.supabase.client.from('Product').select('*').order('createdAt', { ascending: false });
    
    if (storeId) {
      query = query.eq('storeId', storeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async findAllBySlug(slug: string) {
    const { data: store, error: storeError } = await this.supabase.client
      .from('Stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (storeError || !store) throw new NotFoundException(`Tienda con slug '${slug}' no encontrada`);

    const { data, error } = await this.supabase.client
      .from('Product')
      .select('*')
      .eq('storeId', store.id)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: number, storeId?: string) {
    let query = this.supabase.client.from('Product').select('*').eq('id', id);
    if (storeId) {
      query = query.eq('storeId', storeId);
    }
    const { data, error } = await query.single();

    if (error || !data) throw new NotFoundException(`Producto #${id} no encontrado`);
    return data;
  }

  async update(id: number, updateProductDto: UpdateProductDto, storeId: string) {
    const payload: any = { updatedAt: new Date().toISOString() };

    if (updateProductDto.name !== undefined)           payload.name = updateProductDto.name;
    if (updateProductDto.description !== undefined)    payload.description = updateProductDto.description;
    if (updateProductDto.price !== undefined)          payload.price = updateProductDto.price;
    if (updateProductDto.imageUrl !== undefined)       payload.imageUrl = updateProductDto.imageUrl;
    if (updateProductDto.category !== undefined)       payload.category = updateProductDto.category;
    if (updateProductDto.isActive !== undefined)       payload.isActive = updateProductDto.isActive;
    if (updateProductDto.variants !== undefined)       payload.variants = updateProductDto.variants;
    if (updateProductDto.specifications !== undefined) payload.specifications = updateProductDto.specifications;

    const { data, error } = await this.supabase.client
      .from('Product')
      .update(payload)
      .eq('id', id)
      .eq('storeId', storeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: number, storeId: string) {
    const { error } = await this.supabase.client
      .from('Product')
      .delete()
      .eq('id', id)
      .eq('storeId', storeId); // Ensure they own it

    if (error) throw error;
    return { deleted: true };
  }
}
