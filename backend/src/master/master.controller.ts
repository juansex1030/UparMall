import { Controller, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('master')
@UseGuards(SupabaseAuthGuard)
export class MasterController {
  private readonly adminEmails = ['juanse1030@gmail.com', 'uparshopelectronics@gmail.com'];

  constructor(private readonly supabase: SupabaseService) {}

  @Get('stores')
  async getAllStores(@User() user: any) {
    // Verificar si el usuario es un Super Admin
    if (!this.adminEmails.includes(user.email)) {
      throw new UnauthorizedException('No tienes permisos de Super Administrador');
    }

    // Obtener todas las tiendas
    const { data: stores, error: storesError } = await this.supabase.client
      .from('Stores')
      .select('*')
      .order('createdAt', { ascending: false });

    if (storesError) throw storesError;

    // Obtener todos los usuarios de Auth para cruzar los correos
    // Nota: listUsers() requiere la service_role key, que ya configuramos en el SupabaseService
    const { data: { users }, error: authError } = await this.supabase.adminClient.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error listando usuarios de auth:', authError);
      // Si falla la lista de auth, devolvemos las tiendas sin el correo para no bloquear
      return stores;
    }

    // Cruzar información
    const enrichedStores = stores.map(store => {
      const owner = (users as any[]).find(u => u.id === store.id);
      return {
        ...store,
        ownerEmail: owner ? owner.email : 'N/A'
      };
    });

    return enrichedStores;
  }
}
