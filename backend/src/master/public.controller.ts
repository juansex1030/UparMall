import { Controller, Get, Post, Body } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('public')
export class PublicController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get('stores')
  async getPublicStores() {
    const { data, error } = await this.supabase.adminClient
      .from('Settings')
      .select('businessName, logoUrl, Stores(slug)')
      .not('logoUrl', 'is', null);

    if (error) throw error;

    return data.map(item => ({
      name: item.businessName,
      logo: item.logoUrl,
      slug: (item.Stores as any)?.slug
    }));
  }

  @Post('contact')
  async submitContact(@Body() lead: any) {
    // Guardar el prospecto en la base de datos
    const { error } = await this.supabase.adminClient
      .from('Leads')
      .insert([{
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message
      }]);

    if (error) {
      console.error('Error saving lead:', error);
      throw error;
    }

    return { success: true };
  }
}
