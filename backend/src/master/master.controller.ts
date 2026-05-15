// UparMall Master Controller - Security Hardened v2.1
import { Controller, Get, Post, Body, UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { User } from '../auth/user.decorator';
import { MailService } from '../utils/mail.service';

@Controller('master')
@UseGuards(SupabaseAuthGuard)
export class MasterController {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly mailService: MailService
  ) {}

  /**
   * Helper to verify super-admin permissions
   */
  private checkSuperAdmin(user: any) {
    const adminEmails = (process.env['ADMIN_EMAILS'] || 'juanse1030@gmail.com,uparshopelectronics@gmail.com,manuel7xs@gmail.com').split(',');
    if (!adminEmails.includes(user.email)) {
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

    const password = body.password || this.generateRandomPassword();

    // 1. Crear el usuario en Auth usando el admin client
    const { data: authData, error: authError } = await this.supabase.adminClient.auth.admin.createUser({
      email: body.email,
      password: password,
      email_confirm: true
    });

    if (authError || !authData.user || !authData.user.email) {
      console.error('Error creating user:', authError);
      throw new BadRequestException(authError?.message || 'No se pudo crear el usuario o el email está ausente');
    }

    const newUser = authData.user;
    const userEmail = newUser.email as string;

    await this.addAuditLog(user.email, 'CREATE_STORE', `Nueva tienda creada para: ${userEmail}`);
    
    // 2. Enviar correo de bienvenida
    await this.mailService.sendWelcomeEmail(userEmail);

    return { 
      message: 'Usuario creado correctamente.', 
      userId: newUser.id,
      email: userEmail,
      password: password // Devolvemos la clave para que el super-admin se la pase al cliente
    };
  }

  @Post('reset-password')
  async resetPassword(@User() user: any, @Body() body: { userId: string; password?: string }) {
    this.checkSuperAdmin(user);

    if (!body.userId) {
      throw new BadRequestException('El ID de usuario es obligatorio');
    }

    const password = body.password || this.generateRandomPassword();

    const { data, error } = await this.supabase.adminClient.auth.admin.updateUserById(
      body.userId,
      { password: password }
    );

    if (error || !data.user || !data.user.email) {
      console.error('Error resetting password:', error);
      throw new BadRequestException(error?.message || 'No se pudo restablecer la contraseña');
    }

    const updatedUser = data.user;
    const updatedEmail = updatedUser.email as string;

    await this.addAuditLog(user.email, 'RESET_PASSWORD', `Contraseña restablecida para: ${updatedEmail}`);
    return { 
      message: 'Contraseña restablecida correctamente.', 
      email: updatedEmail,
      newPassword: password
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

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }
}
