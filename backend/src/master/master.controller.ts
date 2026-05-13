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

  @Get('leads')
  async getAllLeads(@User() user: any) {
    this.checkSuperAdmin(user);

    const { data, error } = await this.supabase.adminClient
      .from('Leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Master Leads Error:', error);
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

    await this.addAuditLog(user.email, 'CREATE_STORE', `Nueva tienda creada para: ${authData.user.email}`);
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

    await this.addAuditLog(user.email, 'RESET_PASSWORD', `Contraseña restablecida para: ${data.user.email}`);
    return { 
      message: 'Contraseña restablecida correctamente.', 
      email: data.user.email
    };
  }

  @Post('delete-lead')
  async deleteLead(@User() user: any, @Body() body: { id: string }) {
    this.checkSuperAdmin(user);

    if (!body.id) {
      throw new BadRequestException('El ID de la solicitud es obligatorio');
    }

    const { error } = await this.supabase.adminClient
      .from('Leads')
      .delete()
      .eq('id', body.id);

    if (error) {
      console.error('Master Delete Lead Error:', error);
      throw error;
    }

    await this.addAuditLog(user.email, 'DELETE_LEAD', `Solicitud ID: ${body.id} eliminada`);
    return { success: true };
  }

  @Post('delete-store')
  async deleteStore(@User() user: any, @Body() body: { id: string }) {
    this.checkSuperAdmin(user);

    if (!body.id) {
      throw new BadRequestException('El ID de la tienda es obligatorio');
    }

    const { error } = await this.supabase.adminClient
      .from('Stores')
      .delete()
      .eq('id', body.id);

    if (error) {
      console.error('Master Delete Store Error:', error);
      throw error;
    }

    await this.addAuditLog(user.email, 'DELETE_STORE', `Tienda ID: ${body.id} eliminada`);
    return { success: true };
  }

  @Get('platform-settings')
  async getPlatformSettings(@User() user: any) {
    this.checkSuperAdmin(user);
    const { data, error } = await this.supabase.adminClient
      .from('PlatformSettings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  @Post('platform-settings')
  async updatePlatformSettings(@User() user: any, @Body() body: any) {
    this.checkSuperAdmin(user);
    const { error } = await this.supabase.adminClient
      .from('PlatformSettings')
      .update({
        maintenance_mode: body.maintenance_mode,
        announcement_text: body.announcement_text,
        announcement_active: body.announcement_active,
        updated_at: new Date()
      })
      .eq('id', 1);

    if (error) throw new BadRequestException(error.message);
    await this.addAuditLog(user.email, 'UPDATE_SETTINGS', 'Configuración global actualizada');
    return { success: true };
  }

  @Post('toggle-featured')
  async toggleFeatured(@User() user: any, @Body() body: { id: string, is_featured: boolean }) {
    this.checkSuperAdmin(user);
    const { error } = await this.supabase.adminClient
      .from('Stores')
      .update({ is_featured: body.is_featured })
      .eq('id', body.id);

    if (error) throw new BadRequestException(error.message);
    await this.addAuditLog(user.email, 'TOGGLE_FEATURED', `Tienda ${body.id} destacada: ${body.is_featured}`);
    return { success: true };
  }

  @Get('audit-logs')
  async getAuditLogs(@User() user: any) {
    this.checkSuperAdmin(user);
    const { data, error } = await this.supabase.adminClient
      .from('AuditLogs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  private async addAuditLog(email: string, action: string, details: string) {
    try {
      await this.supabase.adminClient
        .from('AuditLogs')
        .insert({ user_email: email, action, details });
    } catch (e) {
      console.error('Audit Log Error:', e);
    }
  }
}
