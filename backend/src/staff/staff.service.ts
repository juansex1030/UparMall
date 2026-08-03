/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StaffService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(storeId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('Staff')
      .select('*')
      .eq('store_id', storeId)
      .order('name');

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async create(
    storeId: string,
    payload: { name: string; role: string; pin_code: string },
  ) {
    const { data, error } = await this.supabase.adminClient
      .from('Staff')
      .insert([{ store_id: storeId, ...payload }])
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async update(id: string, payload: any, storeId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('Staff')
      .update(payload)
      .eq('id', id)
      .eq('store_id', storeId)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async delete(id: string, storeId: string) {
    const { error } = await this.supabase.adminClient
      .from('Staff')
      .delete()
      .eq('id', id)
      .eq('store_id', storeId);

    if (error) throw new InternalServerErrorException(error.message);
    return true;
  }
}
