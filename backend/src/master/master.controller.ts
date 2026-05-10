import { Controller, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('master')
@UseGuards(SupabaseAuthGuard)
export class MasterController {
  private readonly adminEmails = ['juanse1030@gmail.com', 'uparshopelectronics@gmail.com'];

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Helper to verify super-admin permissions
   */
  private checkSuperAdmin(user: any) {
    if (!this.adminEmails.includes(user.email)) {
      throw new UnauthorizedException('No tienes permisos de Super Administrador');
    }
  }

  @Get('stores')
  async getAllStores(@User() user: any) {
    this.checkSuperAdmin(user);

    const { data: stores, error: storesError } = await this.supabase.adminClient
      .from('Stores')
      .select('*')
      .order('createdAt', { ascending: false });

    if (storesError) throw storesError;

    const { data: { users }, error: authError } = await this.supabase.adminClient.auth.admin.listUsers();
    
    if (authError) {
      console.error('Master Error (Auth List):', authError);
      return stores;
    }

    return stores.map(store => ({
      ...store,
      ownerEmail: (users as any[]).find(u => u.id === store.id)?.email || 'N/A'
    }));
  }

  @Get('orders')
  async getAllOrders(@User() user: any) {
    this.checkSuperAdmin(user);

    // Using 'Orders' as the primary table with the correct relation and field names
    const { data, error } = await this.supabase.adminClient
      .from('Orders')
      .select('*, Stores:store_id ( slug ), OrderItems ( * )')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Master Orders Error:', error);
      return [];
    }
    
    return data || [];
  }
}
