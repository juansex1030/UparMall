/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TablesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(storeId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('Tables')
      .select('*')
      .eq('store_id', storeId)
      .order('name');

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async create(storeId: string, name: string) {
    const { data, error } = await this.supabase.adminClient
      .from('Tables')
      .insert([{ store_id: storeId, name, status: 'free' }])
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async updateStatus(
    tableId: string,
    status: string,
    storeId: string,
    orderId?: string,
  ) {
    const payload: any = { status };
    if (orderId !== undefined) {
      payload.current_order_id = orderId;
    }

    const { data, error } = await this.supabase.adminClient
      .from('Tables')
      .update(payload)
      .eq('id', tableId)
      .eq('store_id', storeId)
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async delete(tableId: string, storeId: string) {
    const { error } = await this.supabase.adminClient
      .from('Tables')
      .delete()
      .eq('id', tableId)
      .eq('store_id', storeId);

    if (error) throw new InternalServerErrorException(error.message);
    return true;
  }
}
