import { Controller, Get, Post, Body, UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('master')
@UseGuards(SupabaseAuthGuard)
export class MasterController {
  private readonly adminEmails = ['juanse1030@gmail.com', 'uparshopelectronics@gmail.com', 'manuel7xs@gmail.com'];

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

  @Post('create-store')
  async createStore(@User() user: any, @Body() body: { email: string; password?: string }) {
    this.checkSuperAdmin(user);

    if (!body.email) {
      throw new BadRequestException('El correo electrónico es obligatorio');
    }

    const password = body.password || 'UparMall2026*';

    // 1. Crear el usuario en Auth usando el admin client
    const { data: authData, error: authError } = await this.supabase.adminClient.auth.admin.createUser({
      email: body.email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating user:', authError);
      throw new BadRequestException(authError.message);
    }

    return { 
      message: 'Usuario creado correctamente. La tienda se inicializará al primer acceso.', 
      userId: authData.user.id,
      email: authData.user.email
    };
  }

  @Post('reset-password')
  async resetPassword(@User() user: any, @Body() body: { userId: string; password?: string }) {
    this.checkSuperAdmin(user);

    if (!body.userId) {
      throw new BadRequestException('El ID de usuario es obligatorio');
    }

    const password = body.password || 'UparMall2026*';

    const { data, error } = await this.supabase.adminClient.auth.admin.updateUserById(
      body.userId,
      { password: password }
    );

    if (error) {
      console.error('Error resetting password:', error);
      throw new BadRequestException(error.message);
    }

    return { 
      message: 'Contraseña restablecida correctamente.', 
      email: data.user.email
    };
  }
}
